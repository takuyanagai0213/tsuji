# x402 endpoint design

## Phase 1 minimum implementation

### Stack

- **runtime**: Cloudflare Workers
- **language**: TypeScript
- **middleware**: x402 official(Coinbase Developer Platform)
- **chain**: Base(USDC on Base)
- **wallet**: 永井さま Coinbase Wallet address(Phase 1 で取得)

### Endpoint URL pattern

```
https://api.takuyanagai0213.com/x402/skill        # Skill API
https://api.takuyanagai0213.com/x402/memory       # Memory query
https://api.takuyanagai0213.com/x402/consulting   # Consulting invoice
https://api.takuyanagai0213.com/x402/brand-fact   # Brand fact endpoint
```

### Pseudocode(Phase 1 Skill API endpoint example)

```typescript
import { x402Middleware } from "@coinbase/x402";

export default {
  async fetch(request: Request): Promise<Response> {
    const middleware = x402Middleware({
      price: "0.50",
      token: "USDC",
      chain: "base",
      wallet: "0x...永井さま wallet address",
      facilitator: "https://x402.coinbase.com/facilitator",
    });

    const paymentResult = await middleware(request);
    if (paymentResult.status === 402) return paymentResult;

    // payment verified, deliver resource
    const skillResult = await callSkill(request);
    return new Response(JSON.stringify(skillResult), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

実装目安: 50 行程度、 1 endpoint あたり。

## Phase 2+ extensions

- World ID verification(「AI 決済の背後に実在人間」 signal)
- streaming micropayment(memory query 高頻度時)
- 多 chain support(Solana / Stellar 並走)
- price discrimination(client 種別 / volume 別)

## Phase 1 戦略 補強(2026-05-09 jphfa anchor 統合)

### 起点

2026-05-09 jphfa(zenn.dev/jphfa)の x402 実装記事 2 件 retrieve、 永井さま path Phase 1 戦略の大幅補強 anchor として統合:

- [x402-ai-crawler-monetization](https://zenn.dev/jphfa/articles/x402-ai-crawler-monetization)
- [x402-freemium-geo-strategy](https://zenn.dev/jphfa/articles/x402-freemium-geo-strategy)

詳細: [[thought_jphfa_x402_implementation_anchor_2026_05_09]]

### Critical insight: フリーミアム default に倒す

jphfa が **「導入 3 日で課金停止」 実証 fact** を共有、 「x402 に対応しているのは現時点で OpenAI 系の一部だけ、 全面課金 = 鎖国状態」 anchor。

→ 永井さま Phase 1 default を **全面 x402 課金 → フリーミアム + シグナル宣言** に変更。

### Phase 1 design 補強(フリーミアム + 4 軸)

| 項目 | 戦略 |
|---|---|
| 無料化対象 | Skill catalog metadata / brand fact / Memory query 統計 / API 統計 / GitHub Issue 受付 |
| 有料維持 | Memory bank verbatim excerpt / Skill API verbatim call / Consulting invoice / バルクエクスポート |
| シグナル手法 | 200 OK で返却 + レスポンスヘッダーに `X-Payment-Required: x402` 対応宣言 |
| 価格 | $0.10 default(jphfa 整合)、 段階的 calibration |

### 4 軸補強(jphfa 実装 4 軸 採用)

1. **x402 シグナルヘッダー**: 支払い強制でなく「対応宣言」 による段階的導入
2. **llms.txt / robots.txt 最適化**: AI クローラーのディスカバリー導線整備
3. **コンテンツネゴシエーション**: `Accept: text/markdown` による機械可読形式提供
4. **`.well-known/` ファイル群**: `agentic-capabilities.json` による能力宣言(Skill API list / pricing / chain support / wallet address)

### Stack 補強(jphfa 採用 stack)

| 要素 | 採用候補 | 採用理由 |
|---|---|---|
| フレームワーク | **Hono** | jphfa 採用、 ミドルウェア組み合わせやすさ、 Cloudflare Workers 整合 |
| 基盤 | **Cloudflare Workers + D1 + Analytics Engine** | jphfa 採用、 Analytics Engine で支払いトラッキング |
| 決済 chain | **Base USDC** or **Solana USDC** | jphfa = Solana、 Coinbase Wallet 推奨 = Base、 Phase 1 で選択判断 |

### Base vs Solana 比較

| 軸 | Base | Solana |
|---|---|---|
| 取引速度 | 1-2 秒 | < 1 秒 |
| gas fee | < $0.01 | < $0.001 |
| Coinbase Wallet 整合 | ◎ default | △ Phantom 等別 wallet |
| jphfa 採用 | ✗ | ◎ |
| AI agent ecosystem | ○ AWS / Anthropic Claude integrate | ○ OpenAI 系強い |
| 永井さま受信 wallet | Coinbase Wallet 推奨 | Phantom etc |

→ Phase 1 で永井さま judgment trigger 待ち、 default = Base(Coinbase Wallet 整合最良)。

### Pseudocode 例(jphfa 12 行 form 整合 + Hono + フリーミアム)

```typescript
import { Hono } from "hono";
import { x402Middleware } from "@coinbase/x402";

const app = new Hono();

app.use("*", async (c, next) => {
  const userAgent = c.req.header("user-agent") || "";
  const isAIAgent = /GPTBot|ChatGPT|Claude|Perplexity|GoogleOther|CCBot/i.test(userAgent);

  if (isAIAgent && c.req.path.startsWith("/x402/premium")) {
    return x402Middleware({
      price: "0.10",
      token: "USDC",
      chain: "base",
      wallet: "0x...永井さま wallet address",
      facilitator: "https://x402.coinbase.com/facilitator",
    })(c, next);
  }

  c.header("X-Payment-Required", "x402"); // シグナル宣言(全 path)
  return next();
});

app.get("/x402/skill-catalog", (c) => c.json({ skills: ["..."] })); // 無料 default
app.get("/x402/premium/skill-call", (c) => c.json({ result: "..." })); // 有料 (premium 配下)

export default app;
```

## 関連

- [x402 official docs](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Cloudflare Workers x402 integration](https://blog.cloudflare.com/x402/)
- [jphfa: x402-ai-crawler-monetization](https://zenn.dev/jphfa/articles/x402-ai-crawler-monetization)
- [jphfa: x402-freemium-geo-strategy](https://zenn.dev/jphfa/articles/x402-freemium-geo-strategy)
- [[thought_jphfa_x402_implementation_anchor_2026_05_09]] — Phase 1 戦略 補強 anchor 詳細
