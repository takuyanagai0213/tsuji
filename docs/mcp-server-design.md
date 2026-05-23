# tsuji MCP サーバー設計(x402 課金つき有料 MCP ツール)

> Status: **設計レビュー待ち**(2026-05-23 起票)
> 本 doc は実装前のレビュー対象。確定後、本 doc が実装の SSOT になる。

## 1. Problem statement ─ なぜ MCP サーバー化するか

tsuji の既存 x402 endpoint(`prototypes/x402-endpoint/`)は、**生 HTTP を叩ける agent しか到達できない**:

- AI agent が URL(`https://tsuji-x402-endpoint.nagataku021.workers.dev/x402/premium/...`)を**事前に知っている**必要がある
- かつ x402 を HTTP レイヤーで実装した client しか支払えない
- discovery は `llms.txt` / `.well-known/agentic-capabilities.json` / GitHub README に頼る = AI crawler が「拾ってくれたら」届く受動経路

2026-05-18、Anthropic が Stainless(OpenAPI → SDK / MCP サーバー自動生成ツール)を $300M 超で買収。MCP が「agent ⇄ 世界の API」の事実上の標準として加速する局面に入った。

MCP サーバー化すると到達構造が変わる:

| | 現状(HTTP x402) | MCP サーバー化後 |
|---|---|---|
| 発見 | URL を知っている / crawler が拾う | MCP 対応 agent が `tools/list` で**一覧から発見** |
| 接続 | x402 を HTTP 実装した client のみ | MCP 対応 agent 全部(Claude / ChatGPT / Cloudflare Agents 等) |
| 課金 | HTTP 402 を理解する client のみ | x402 対応 MCP client が透過的に支払い |
| tsuji の立ち位置 | 「URL を知る人だけの店」 | 「辻に暖簾を出した店 ── 通りがかった agent が品書きを見て買える」 |

= 江戸の辻商売 metaphor の物理的完成形。これまで「辻に立っていたが品書きが無かった」状態から、「品書き(`tools/list`)を出した辻の店」になる。プル型整合(押し付けず、来た agent が見て選ぶ)。

### トラフィック実測による裏付け(2026-05-23)

上記の構造的問題は、現行 HTTP endpoint の実トラフィック(`npm run metrics 30d` / `npm run wallet`)で物理的に裏付けられる。

| 段 | 内容 | 30 日間の実測 |
|---|---|---|
| 段1 到達 | endpoint への HTTP リクエスト | ✅ 324 req(AI agent 186 / human 138)、402 signal 68 件 |
| 段2 経済成立 | premium endpoint の支払い完了(200) | ✗ **0 件**(X-Payment 付き再リクエストはゼロ) |
| 段3 on-chain 着金 | ウォレットへの USDC 入金 | ✗ **0 件**(ERC-20 transfer なし) |

「到達はあるが経済成立はゼロ」状態が継続している。内訳を見ると問題の構造が分かる:

- **到達の 56% は crawler の discovery 行動**: `robots.txt` 103 + `sitemap.xml` 80 = 183 req。`ClaudeBot` が 142 req と突出 ── AI crawler が discovery ファイルを舐めているだけで、コンテンツ取得ではない。
- **premium 402 の 68 件は需要シグナルではない**: 402 を返した相手の User-Agent はほぼ全て crawler 系(ClaudeBot)と `curl`(自己テスト)。**crawler は 402 を見ても支払わない。x402 を理解して自動決済する autonomous agent は1件も到達していない。**
- **reach trend は下降中**: 5/12 ピーク 63 req → 直近は 1 日 6-7 req。novelty 切れで crawler の再訪頻度が落ちている。

= 現行 HTTP endpoint は「生 URL を crawler に踏まれるだけ」の状態。x402 で支払う agent が来ない根本理由は、(a) そういう agent が生 HTTP URL を知らない(discovery が crawler 任せ)、(b) premium URL を踏んでいるのが決済しない crawler、の2点。**MCP サーバー化は到達する相手を「crawler」から「`tools/list` で発見し x402 で自動決済する MCP 対応 agent」に変える。** 本設計が解こうとしているのは、この実測された構造的ギャップそのものである。

ただし制約も実測が示す:MCP 化は到達面の質を変えるが、「x402 対応 MCP client を持つ autonomous agent」がエコシステムにまだ少ない以上、段2 がすぐ動く保証はない(§8 の testnet 先行 → 実績後 mainnet 昇格の段階方針が、この現実に対する妥当な進め方)。

### 着地点

**x402 で課金される MCP サーバー = 有料 MCP ツール。** 流れ:

```
agent が MCP で接続 → tools/list でツール一覧 + 価格を見る
  → 無料ツール: そのまま呼べる
  → 有料ツールを呼ぶ → 402(支払い要求)→ x402 決済 → 結果が返る
```

## 2. Background ─ MCP と x402 の関係(調査結果)

MCP と x402 は競合ではなく**別レイヤー**:

- **MCP** = agent がツールをどう発見し、どう呼ぶか(JSON-RPC over Streamable HTTP)
- **x402** = agent がその呼び出しにどう支払うか(HTTP 402 + USDC 決済、3 ヘッダー `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` / `PAYMENT-RESPONSE`)

### x402 + MCP には2つの実装モデルがある(混同注意)

調査で判明した重要な分岐:

| モデル | MCP サーバーの役割 | ウォレットの所有者 | tsuji に合うか |
|---|---|---|---|
| **A. ブリッジ型**(Coinbase docs / 一部の事例) | agent の手元で動くローカル MCP サーバーが、**別の** x402 HTTP API を叩く client になる | agent 側(MCP サーバーが支払う) | ✗ tsuji が MCP サーバーを「出す」形にならない |
| **B. サーバー課金型**(Cloudflare `paidTool` / Vercel `x402-mcp` / mcpay) | MCP サーバー**自身が有料リソース**。ツール呼び出しが課金ゲート | サーバー運営者(= 永井さま)が受け取る | ◎ **これが tsuji のゴール** |

tsuji は「自分で MCP サーバーを公開し、その呼び出しで課金を受け取る」= **モデル B**。

### Cloudflare がモデル B をネイティブサポートしている(決定的)

tsuji は既に Cloudflare Workers 上にある。そして Cloudflare Agents SDK は**まさにこのユースケース専用の機能**を持つ:

- 公式 doc: 「[Charge for MCP tools](https://developers.cloudflare.com/agents/x402/charge-for-mcp-tools/)」
- `agents/x402` の `withX402()` で `McpServer` をラップ
- `paidTool()` = 標準 `tool()` のドロップイン置換。**無料ツールと有料ツールを同一サーバーに混在可**
- 課金フロー = client が有料ツールを支払いなしで呼ぶ → サーバーが 402 + 支払い要件を返す → client が x402 決済 → 支払い証明つきで再試行 → 結果取得
- Cloudflare は x402 Foundation の co-founder。tsuji の既存スタック(Cloudflare Workers + Hono + Base USDC)とそのまま地続き

= **自前で MCP+x402 を合成する必要がない。** プロバイダーが本気で出したものに乗る(`tool-strategy.md`「プロバイダーが本気で出すものを自前で作らない」整合)。

## 3. 現状棚卸し ─ 既存 endpoint 9 件

`prototypes/x402-endpoint/src/index.ts`(729 行、Hono + `x402-hono` v1.x + `@coinbase/x402` v2.1.0 + Cloudflare Workers + Analytics Engine):

| endpoint | method | 課金 | 中身 | データ実体 |
|---|---|---|---|---|
| `/` | GET | 無料 | プロジェクト概要テキスト | ─ |
| `/x402/skill-catalog` | GET | 無料 | 100 Skills のメタデータ抜粋(4件 + total 100) | インライン |
| `/x402/brand-fact` | GET | 無料 | ブランドファクトカード(数字 / 肩書 / 発信チャネル) | インライン |
| `/x402/premium/skill-call` | POST | $0.10 | **stub**(placeholder 文字列、実 skill 実行は未実装) | ─ |
| `/x402/premium/memory` | GET | $0.05 | 思想 / 判断パターン excerpt(`excerpt_id`) | `MEMORY_EXCERPTS` 10 件 |
| `/x402/premium/industry-fact` | GET | $0.10 | 業界 N=1 ファクト(`topic`) | `INDUSTRY_FACTS` 6 件 |
| `/x402/premium/workflow-template` | GET | $1.00 | ワークフロー雛形(`template_id`) | `WORKFLOW_TEMPLATES` 5 件 |
| `/llms.txt` | GET | 無料 | AI 向け discovery インデックス | hard-code |
| `/.well-known/agentic-capabilities.json` | GET | 無料 | 機械可読 capability 宣言 | hard-code |

決済まわり: ウォレット `NAGAI_WALLET_BASE`(Base mainnet、Coinbase Smart Wallet)、facilitator は `@coinbase/x402` の CDP facilitator(Worker secrets `CDP_API_KEY_ID` / `CDP_API_KEY_SECRET`)。premium 4 endpoint は `paymentMiddleware` で base mainnet 課金。

## 4. Spec ─ 何を作るか

既存 HTTP endpoint は**残したまま**、同じ Worker に MCP サーバー面を**追加**する。データは1つの実体を両面が共有する(SSOT)。

### 4.1 MCP ツール設計

> 全 endpoint を機械変換しない。「agent が正しく使えるツール名・説明文」が品質の肝。HTTP ルートではなく **agent がやりたいこと** にツールを対応させる。

#### 公開するツール(7 件)

**無料ツール(発見用、3 件)** ─ 有料ツールを呼ぶ前に「何があるか / どれが自分に必要か」を $0 で判断させるための入り口:

| ツール名 | 説明(要旨) | 戻り値 |
|---|---|---|
| `get_brand_facts` | tsuji 運営者のブランドファクト(コンテキストエンジニアリング実績の数字 / 肩書 / 発信チャネル) | 既存 `/x402/brand-fact` 相当 |
| `list_catalog` | 有料ツールで取得できる全アイテムの**見出し一覧**(業界ファクト6 / メモリ excerpt 10 / ワークフロー雛形5 の id + headline)。どれが $X 払う価値があるか判断する材料 | id + headline のリスト |
| `list_skills` | 永井ハーネスの 100 Skills メタデータ抜粋 | 既存 `/x402/skill-catalog` 相当 |

**有料ツール(3 件)** ─ 既存 premium endpoint のうち**実データがあるもの**だけ:

| ツール名 | 価格 | 入力 | 戻り値 |
|---|---|---|---|
| `get_industry_fact` | $0.10 | `topic`(6 値の enum) | アフィリエイト広告代理店 × Claude Code の N=1 実装ファクト1件 |
| `get_memory_excerpt` | $0.05 | `excerpt_id`(10 値の enum) | 永井さま思想 / 判断パターンの匿名化 excerpt 1件 |
| `get_workflow_template` | $1.00 | `template_id`(5 値の enum) | 再現可能なワークフロー雛形(手順 + コード雛形 + 参照)1件 |

#### 設計判断:有効値の「発見問題」

**重要**: `paidTool` は handler 実行**前**に課金ゲートが発火する。agent が無効な `topic` を渡すと「$0.10 払った後に "unknown topic" エラー」になる ── 支払いの無駄 = 信頼を損なう。

対策を2層で:

1. **入力スキーマを `z.enum([...])` にする** ── 有効値が `tools/list` のスキーマに載る。agent は**支払い前に**スキーマを見て有効な値を選べる。無効値での課金が構造的に起きない。
2. **無料の `list_catalog` で見出しを提供** ── agent が「6 topic のうちどれが $0.10 払う価値があるか」を $0 で判断できる。

= 既存 HTTP 版の「400 で `availableTopics` を返す」(= 支払い後に判明する)挙動を、MCP では**支払い前に解決**する設計に変える。これが MCP 化の品質的な改善点。

#### 公開しないもの

| 対象 | 理由 |
|---|---|
| `skill-call`($0.10 stub) | placeholder 文字列を返すだけ。**stub に課金するのは bad faith** = アンドン案件。実 skill 実行が実装されてから有料ツール化(Phase 2)。v1 では出さない |
| `llms.txt` / `agentic-capabilities.json` | HTTP 世界の discovery ファイル。MCP では `tools/list` が同じ役割。ツール化不要(ただし両ファイルに `/mcp` の存在を**追記**する ── §4.4) |
| `/`(概要テキスト) | MCP サーバーの `name` / `version` / `instructions` が同じ役割 |

#### ツール説明文の書き方(品質の肝)

各ツールの description に必ず含める:

- **何を返すか**(具体的に。「業界ファクト」ではなく「アフィリエイト広告代理店 PdM × Claude Code 運用の N=1 実装記録 ── 数字 / パターン / エッジケース」)
- **いくらか**(有料ツール。Cloudflare の `paidTool` は `tools/list` に price annotation を自動付与するが、説明文にも明記し agent の wallet policy が判断しやすくする)
- **どう値を選ぶか**(「`topic` の有効値は入力スキーマの enum 参照。各 topic の中身は無料 `list_catalog` で確認」)

### 4.2 x402 課金ゲートをどう噛ませるか

Cloudflare Agents SDK の `withX402` + `paidTool` を使う(§5 判断1で代替案と比較)。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { withX402, type X402Config } from "agents/x402";
import { z } from "zod";

const X402_CONFIG: X402Config = {
  network: "base",                                  // 本番 / テストは "base-sepolia"
  recipient: NAGAI_WALLET_BASE,                     // 既存ウォレットを流用(永井さま判断)
  facilitator: { url: FACILITATOR_URL },            // §6 で要検証
};

export class TsujiMCP extends McpAgent<Bindings> {
  server = withX402(
    new McpServer({ name: "tsuji", version: "1.0.0" }),
    X402_CONFIG,
  );

  async init() {
    // 無料ツール
    this.server.tool("get_brand_facts", "...", {}, async () => { ... });
    this.server.tool("list_catalog", "...", {}, async () => { ... });
    this.server.tool("list_skills", "...", {}, async () => { ... });

    // 有料ツール($0.10)
    this.server.paidTool(
      "get_industry_fact",
      "アフィリエイト広告代理店 × Claude Code の N=1 実装ファクトを1件返す。$0.10。topic の中身は無料の list_catalog で確認できる。",
      0.10,
      { topic: z.enum(["claude-code-skills", "memory-bank", "harness-engineering",
                       "affiliate-ad-pdm", "x402-deploy-oneday", "solo-compound-holdings"]) },
      {},
      async ({ topic }) => {
        const fact = INDUSTRY_FACTS[topic];
        return { content: [{ type: "text", text: JSON.stringify(fact) }] };
      },
    );
    // get_memory_excerpt($0.05) / get_workflow_template($1.00) も同形
  }
}
```

課金フロー(`paidTool` が自動で処理):

```
agent → tools/call get_industry_fact(topic) ── 支払いヘッダーなし
tsuji ← 402 + PAYMENT-REQUIRED(価格 / ウォレット / network)
agent → 署名した PAYMENT-SIGNATURE をつけて再試行
facilitator が on-chain 検証・決済
tsuji → handler 実行 → 結果 + PAYMENT-RESPONSE(決済レシート)
```

LLM 側は課金を意識しない ── agent の wallet policy が 402 を受けて支払い可否を判断する。

### 4.3 Cloudflare Workers への載せ方

既存は `export default app`(Hono 単体)。MCP サーバーは `McpAgent`(Durable Object)として別クラスにし、Worker の `fetch` で `/mcp` だけ MCP に、それ以外を既存 Hono に振り分ける:

```typescript
export { TsujiMCP };  // Durable Object として export

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") {
      return TsujiMCP.serve("/mcp").fetch(request, env, ctx);
    }
    return app.fetch(request, env, ctx);   // 既存 HTTP endpoint 9 件はそのまま
  },
};
```

`wrangler.toml` に Durable Object バインディング + migration を追加:

```toml
[[durable_objects.bindings]]
name = "MCP_OBJECT"
class_name = "TsujiMCP"

[[migrations]]
tag = "v1-mcp"
new_sqlite_classes = ["TsujiMCP"]
```

- transport は **Streamable HTTP**(MCP 現行標準。SSE は deprecated)
- MCP エンドポイント URL: `https://tsuji-x402-endpoint.nagataku021.workers.dev/mcp`
- `McpAgent` はセッションごとに Durable Object を1つ持つ(SQLite-backed DO は Workers 無料プランでも利用可 ── §6 で要確認)

### 4.4 データの SSOT 化 + discovery ファイル更新

- `INDUSTRY_FACTS` / `MEMORY_EXCERPTS` / `WORKFLOW_TEMPLATES` を `index.ts` から `src/data.ts` に抽出。HTTP ルートと MCP ツールが**同じ実体を import**(`spec-ssot.md` 整合 ── 二重定義で drift させない)。
- `/llms.txt` と `/.well-known/agentic-capabilities.json` に `/mcp` エンドポイントの存在を追記(MCP 対応 agent への discovery 導線)。`agentic-capabilities.json` には `mcp: { endpoint, transport, tools }` セクションを足す。

## 5. 設計判断(A/B/C 比較)

### 判断1:MCP サーバーの実装方式

| | A. Cloudflare Agents SDK `withX402`+`paidTool` | B. `@hono/mcp` + x402 手組み | C. 別 Worker に分離 |
|---|---|---|---|
| x402 課金 | ネイティブ(`paidTool`) | 手組み or `withX402` 併用 | 同左 |
| 既存スタック整合 | ◎ Cloudflare 純正、Workers 地続き | ○ Hono アプリに `/mcp` ルート追加 | △ インフラ2つ |
| 無料 / 有料ツール混在 | ◎ 標準対応 | △ 自前 | ◎ |
| ツール単位の課金粒度 | ◎ `paidTool` 単位 | ✗ `x402-hono` は HTTP ルート単位 ── 全 MCP 呼び出しが `/mcp` に POST されるため per-tool 課金できない | ◎ |
| 保守 | ◎ プロバイダーが面倒を見る | △ 自前保守 | △ |
| 必要追加 | `agents` / `@modelcontextprotocol/sdk` / `zod` + DO バインディング | `@hono/mcp` + 課金実装 | Worker 1つ + service binding |

→ **推奨 A**。tsuji は既に Cloudflare Workers。プロバイダー純正で「有料 MCP ツール」がそのまま組める。B は per-tool 課金が HTTP 層で不可能(`x402-hono` はルート単位 ── MCP は全ツールが `/mcp` 1ルート)で、結局 `withX402` 相当を自前 or 併用する羽目になる。C はインフラ分割の必然性がない。

### 判断2:MCP サーバーの配置

| | A. 同一 Worker(`/mcp` ルート分岐) | B. 別 Worker |
|---|---|---|
| デプロイ | 1つ | 2つ |
| ドメイン | 既存と同一 | 別 or サブパス |
| データ共有 | 同一プロセス、`src/data.ts` を直 import | service binding 越し |
| Analytics | 既存 middleware を再利用しやすい | 別途 |
| 既存 HTTP endpoint への影響 | `fetch` 入口の分岐追加のみ | なし |

→ **推奨 A(同一 Worker)**。データ実体を直に共有でき SSOT が自然。`fetch` 入口に `/mcp` 分岐を足すだけで既存 9 endpoint は無傷。

### 判断3:有料ツールの「有効値発見」方式

| | A. `z.enum` + 無料 `list_catalog` 併用 | B. `z.enum` のみ | C. 説明文に有効値列挙のみ |
|---|---|---|---|
| 無効値での誤課金 | ◎ 起きない(スキーマで弾く) | ◎ 起きない | △ enum なしだと起きうる |
| 「どれを買う価値があるか」判断 | ◎ 見出しを $0 で確認 | △ id しか分からない | ○ 説明文次第、肥大化 |
| 実装コスト | 小(無料ツール1つ追加) | 最小 | 最小 |

→ **推奨 A**。`z.enum` で誤課金を構造的に防ぎ、無料 `list_catalog` で「払う価値」判断材料を提供。両方やっても実装コストは小さい。

### 判断4:既存 HTTP x402 endpoint の扱い

→ **両面を維持(残す)**。MCP サーバーは HTTP endpoint の置き換えではなく**追加の到達面**:

- HTTP x402 面 = x402-HTTP 対応 agent + AI crawler(`llms.txt` / `agentic-capabilities.json` 経由)向け
- MCP 面 = MCP 対応 agent(`tools/list` 経由)向け

同じデータ(`src/data.ts`)を2つの面が配信。到達経路が増える。撤去判断は将来、実トラフィック実績を見てから(`release-policy.md` の学習ループ整合)。

## 6. Constraints ─ 壊してはいけないもの

- **既存 HTTP endpoint 9 件**を壊さない(live 稼働中。AI crawler 到達実績あり ── `/` 分岐は `/mcp` 以外を素通しにする)
- **Analytics Engine ロギング**を壊さない(現 `app.use("*")` の datapoint 書き込み。MCP 側のアクセスも計上できると望ましいが、最低限 HTTP 側を維持)
- **anonymous ブランド維持** ── MCP サーバーの `name` / ツール説明文に、既に公開済み(GitHub / Zenn / note)を超える実名情報を載せない
- **プル型** ── MCP サーバーは discoverable にするが、push しない
- **お金 / 外部公開に関わる判断は永井さま**(§8)── 勝手に確定させない
- 全変更は **PR 経由**

## 7. Scope boundary ─ out of scope(v1 でやらない)

- `skill-call` の実 skill 実行(stub のまま。有料ツール化は実装後の Phase 2)
- Consulting / メンバーシップ / enterprise endpoint(`endpoint-roadmap` の Phase 2-3)
- MCP の resources / prompts プリミティブ(v1 は tools のみ)
- MCP サーバーの OAuth / 認証(v1 は authless ── §8 で永井さま確認)
- Solana / マルチチェーン対応
- カスタムドメイン(`mcp.takuyanagai0213.com` 等)── §8

## 8. 永井さま判断ポイント(アンドン ── お金 / 外部公開)

実装着手前に確認が必要な、お金と外部公開に関わる判断:

| # | 論点 | 既定の提案(永井さま判断で変更可) |
|---|---|---|
| 1 | **価格** | MCP ツールも既存 HTTP と同額($0.10 / $0.05 / $1.00)を踏襲 |
| 2 | **testnet 先行 か mainnet 直か** | 既存 Phase 0.8 と同じく **base-sepolia testnet で先行公開** → end-to-end テスト成功後に mainnet 昇格(`docs/2026-05-13-phase1-self-verify-runbook.md` と同じ段階手順) |
| 3 | **MCP サーバーを authless で公開してよいか** | authless(誰でも接続可)。有料ツールは x402 課金で実質ゲートされる。無料ツールは公開情報のみ |
| 4 | **`skill-call` ツールを v1 で出さない** | 出さない(stub に課金しない)。実装後 Phase 2 で有料ツール化 |
| 5 | **受取ウォレット** | 既存 `NAGAI_WALLET_BASE`(Base mainnet)を MCP の `recipient` にも流用 |
| 6 | **カスタムドメイン** | v1 は `workers.dev` のまま。custom domain は別 turn |

加えて実装フェーズで**技術検証が必要な未確定点**(これは実装内で解決、永井さま判断不要):

- `withX402` の `facilitator` が CDP facilitator(mainnet 用、API key 認証)を受けられるか。x402.org facilitator は testnet 中心 ── mainnet 移行時に CDP facilitator 連携を要検証
- Cloudflare Agents SDK の x402 が x402 **v2**(v0.4.0 で v2 移行済)。既存 HTTP 側は `x402-hono` v1.x。同一 Worker に v1 と v2 の x402 が同居する形になる ── 別ミドルウェアインスタンスなので独立動作する想定だが、実装時に確認
- `McpAgent` の Durable Object が Workers 無料プランで使えるか(SQLite-backed DO は無料プラン可のはず ── 要確認)
- `paidTool` / `withX402` の正確な引数シグネチャ・パッケージバージョンを、インストールした `agents` パッケージ実物で確認

## 9. 実装計画(レビュー確定後)

1. `agents` / `@modelcontextprotocol/sdk` / `zod` を `package.json` に追加
2. `INDUSTRY_FACTS` / `MEMORY_EXCERPTS` / `WORKFLOW_TEMPLATES` を `src/data.ts` に抽出、HTTP ルートを `data.ts` 参照に変更
3. `src/mcp.ts` に `TsujiMCP extends McpAgent` を実装(無料3 + 有料3 ツール)
4. `src/index.ts` の `fetch` 入口に `/mcp` 分岐を追加、`TsujiMCP` を export
5. `wrangler.toml` に DO バインディング + migration 追加
6. `llms.txt` / `agentic-capabilities.json` に `/mcp` を追記
7. `base-sepolia` で deploy → MCP Inspector / x402 対応 client で end-to-end テスト(`tools/list` → 無料ツール → 有料ツール 402 → 決済 → 結果)
8. テスト成功 → 永井さま判断で mainnet 昇格

## 10. Change history

- 2026-05-23: 初版起票(設計レビュー待ち)。Anthropic の Stainless 買収を背景に、既存 x402 HTTP endpoint を MCP サーバー化する設計。Cloudflare Agents SDK `withX402`+`paidTool` 採用、同一 Worker に `/mcp` を追加、無料3 + 有料3 ツール、既存 HTTP 面は維持。
- 2026-05-23: §1 に「トラフィック実測による裏付け」節を追加。30 日間の実測(到達 324 req / 経済成立 0 / 着金 0、到達の 56% が crawler discovery)で、MCP 化が解く構造的ギャップを物理証拠化。

## 関連

- `~/MyWorkspace/tsuji/docs/x402-endpoint-design.md` — 既存 HTTP x402 endpoint 設計(本 doc の前提)
- `~/MyWorkspace/tsuji/docs/architecture.md` — tsuji 全体アーキテクチャ
- `~/MyWorkspace/tsuji/docs/endpoint-roadmap-2026-05-10.md` — endpoint 拡張ロードマップ
- `~/MyWorkspace/tsuji/prototypes/x402-endpoint/src/index.ts` — 既存実装(729 行)
- [Charge for MCP tools — Cloudflare Agents docs](https://developers.cloudflare.com/agents/x402/charge-for-mcp-tools/)
- [Build a Remote MCP server — Cloudflare Agents docs](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [x402 — Cloudflare Agents docs](https://developers.cloudflare.com/agents/agentic-payments/x402/)
- [MCP Server with x402 — x402.org](https://docs.x402.org/guides/mcp-server-with-x402)
- [Introducing x402-mcp — Vercel](https://vercel.com/blog/introducing-x402-mcp-open-protocol-payments-for-mcp-tools)
