---
title: "x402 エコシステム catchup ── 呑まれた層の確定 と discovery gap の発見(2026-08-11)"
status: decided_layers / pending_owner_trigger
created: 2026-08-11
purpose: 5 月の賭けの答え合わせ、自作を止める層の確定、および tsuji が公式ディスカバリ層に載っていない原因の特定
---

# 呑まれた層の確定 と discovery gap(2026-08-11)

## 要旨

賭けは 2 つに割れていて、答えが逆に出た。

1. **市場側(x402 が AI エージェント決済の標準になる)= 当たった。** 2026-07-14 に Linux Foundation が x402 Foundation の運用を開始、Coinbase からの移管完了。Premier メンバー 17 社に Visa / Mastercard / Stripe / Google / AWS / Shopify / Cloudflare。
2. **supplier 側(自作 endpoint で経済参加する)= 3 ヶ月ゼロ。** wallet 着金 0、公式ディスカバリ層に不在、30 日の AI エージェント到達 579 件のうち有料エンドポイント接触は 1 件。
3. **新発見: 載っていない理由が特定できた。** 詳細は §3。要件は 2 つあり、どちらも未達。

## 1. 実測(2026-08-11、読み取りのみ)

### wallet ── 独立 2 経路で 0 を確認

| 観測 | 値 |
|---|---|
| `eth_getTransactionCount` | `0x0` |
| USDC `balanceOf`(Base mainnet) | `0` |
| `eth_getCode` | `0x`(Smart Wallet 未デプロイ) |
| Blockscout ERC-20 transfers | 0 件 |

対照実験として同じ RPC・同じ ABI エンコードで USDC `totalSupply` を叩き、巨大な値が返ることを確認済。「0 が返った」は測定失敗ではない。

### 到達 ── クローラは索引に来て、買いに来ない

直近 30 日(`npm run metrics 30d`、5/11 に常設化した装置がそのまま稼働):

| 区分 | 件数 |
|---|---|
| 総リクエスト | 701 |
| AI エージェント | 579 |
| うち `/robots.txt` + `/sitemap.xml` | **573** |
| うち有料エンドポイント接触 | **1**(GPTBot が `/x402/premium/skill-call`、402 を受けて再リクエストなし) |
| 段 2 完了(200) | **0** |

有料エンドポイントの 402 は 41 件だが、内訳は SemrushBot(SEO クローラ)21 件 + 人間のブラウザで、AI エージェントは上記 1 件のみ。

**構造判定: 段 1(到達)は段 2(支払い)の先行指標ではない。** 5/12 の discovery 層(robots.txt + sitemap.xml)は AI クローラの巡回を確実に増やしたが、増えたのは索引行動であって購買行動ではなかった。

## 2. 市場側 ── 5 月から何が動いたか

| 日付 | 出来事 |
|---|---|
| 2026-03-18 | Stripe + Tempo が MPP(Machine Payments Protocol)公開。x402 の 1 回のハンドシェイクを、価格発見・課金・サブスク・残高照合まで含むライフサイクルの封筒で包む。署名基盤(EIP-3009 / Permit2)は共有 |
| 2026-07-01 | **Cloudflare Monetization Gateway** 発表(waitlist)。「Web ページ・データセット・API・MCP ツール」を x402 で課金し、検証と決済を edge が代行 |
| 2026-07-01 | **Stripe machine payments** 公開プレビュー(グローバル)。x402 = Base USDC / MPP = Tempo・Solana。**決済は Stripe 残高に法定通貨で入金**、返金は Refunds API、最低 0.01 USDC |
| 2026-07-14 | **x402 Foundation** 運用開始(Linux Foundation)、40 組織 |
| 2026-08-04 | **Cloudflare Wallets** 発表。ハンドル予約のみ稼働、Virtual Wallet の発行・入出金は「数ヶ月後」 |

数字(x402 Adoption Tracker / 2026-06-26 時点、および 2026-08-05 の独立分析):

- 販売者 約 22,000 / 買い手 約 94,000
- 直近 30 日 310 万件 / 移転額 **$1.2M** → 1 販売者あたり月 **$55**
- ただし **95% はプロトコルの疎通確認**で、真の 1 日商業流通は **約 $28,000**(ウォッシュ分を除くと 1 販売者あたり月 $38、中央値はおそらく $0)

**5 月の収益試算「フェーズ 1 baseline = 月 $0〜5」は当たっている。** 外れたのは金額ではなく「自然到達が増えれば段 2 に移る」という経路の想定。

## 3. discovery gap ── 載っていない原因(新発見)

x402 Bazaar(Coinbase CDP の公式ディスカバリ層、認証不要の公開 API)の全件を走査した。

```
https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=1000&offset=N
→ 索引総数 14,650 エンドポイント / 販売ホスト 1,547
→ tsuji / nagataku021 / wallet アドレス = 0 ヒット
→ 対照: 他の *.workers.dev 販売者は 411 ヒット、USDC-on-Base アセットは 16,536 ヒット
```

不在の理由は 2 つあり、**どちらも独立に効く**。

### 要件① 課金成功 1 件(未達)

公式ドキュメント(`docs.cdp.coinbase.com/x402/seller/get-discovered`)の掲載要件:

> Complete a successful paid call through the CDP Facilitator

**発見されるには 1 回売れている必要があり、売れるには発見されている必要がある。** tsuji はこのループの外にいる。自然到達だけでは初回課金に届かない ── §1 の「クローラは買わない」がこれを裏づける。

**これが `docs/phase1-self-verify-runbook.md` の意味を変える。** 5 月に書いた時点での価値は「配管の疎通確認」($0.11 で自己送金)だったので 3 ヶ月繰り延べられた。**いまは掲載ゲートの通過手段**である。

### 要件② メタデータ(部分未達)

| 項目 | tsuji の現状 | Bazaar 掲載側の例 |
|---|---|---|
| `discoverable` | **✅ 設定済**(live 402 payload の `outputSchema.input.discoverable: true` で確認) | 同 |
| `inputSchema`(JSON Schema) | ❌ なし | `$schema` 付きの完全な JSON Schema + `pattern` 制約 |
| 出力例 | ❌ なし | `output.example` |
| `extensions.bazaar` | ❌ なし | `info` / `schema` を持つ(索引 14,650 件中 262 件が保持) |

公式の注記: 「For routes accepting inputs, add schemas and examples — **without them, agents can discover your endpoint but can't construct a valid call**」。tsuji の 4 endpoint はすべてクエリパラメータ(`topic` / `template_id` / `excerpt_id` / `skill_id`)を取るので、この注記に直接該当する。

### 併せて判明 ── プロトコルが v1 系のまま

| | tsuji | エコシステム |
|---|---|---|
| npm パッケージ | `x402-hono@^1.2.0` / `x402@1.2.0` ── **2026-04-16 以降更新なし** | `@x402/hono` / `@x402/core` **2.21.0(2026-08-04 公開)** が保守系列 |
| `x402Version` | 1 | 索引側は 2 |
| network 表記 | `"base"` | **CAIP-2 形式 `eip155:8453`** ── 索引 14,650 件の**全件**が CAIP-2(v1 形式の `"base"` は 0 件) |

5 月の残タスクに「`@x402/hono` v2 移行(deprecated 警告対応)」と書いて見送っていたが、**見た目の警告ではなくエコシステムの系列そのものが移っていた**。

**ただし因果は未証明**: v1 のままで課金できないとは確認していない。むしろ `@x402/core` 2.21.0 の型定義には `PaymentRequiredV1` / `PaymentPayloadV1` / `VerifyRequestV1` が明示的に残っており、**v2 クライアントは v1 サーバを引き続きモデルしている**。よって自己送金は v2 移行を待たずに試せる ── 通るかどうかは runbook の Step 1 が即座に答える。

## 4. 3 層仕分け ── 何を自作しないか

`/factory` の伝達路が公式 messaging に呑まれた時と同じ問いを当てる。

### 呑まれた層(譲る)

| 5 月に自作したもの | 呑んだ公式 |
|---|---|
| Hono + `x402-hono` + CDP facilitator を Workers に自前デプロイ、wallet を自分で持ち、mainnet 切替も自分で | **Cloudflare Monetization Gateway** ── 「You will not need to onboard the buyer or stand up a billing system. You will write a rule and agentic buyers will pay for what they use.」**呑んだのは tsuji が現に動いているプラットフォーム自身** |
| USDC を wallet で受け、税務・返金・不正対策は未実装 | **Stripe machine payments** ── 暗号ウォレットなしで x402 を受け、法定通貨で Stripe 残高に入金 |
| `llms.txt` / `sitemap.xml` / `robots.txt` の自前 discovery 層(5/12) | **x402 Bazaar** ── 14,650 エンドポイントの公式索引。自前 discovery 層は AI クローラには効いたが買い手には効かなかった |

**判定: この 3 つは自作を続けない。** 売り手側 waitlist は 2026-08-07 に登録済(→ CLAUDE.md 8/6-8/7 entry)。

### 残る層

| 層 | 状態 |
|---|---|
| **売るもの(一次情報コンテキスト)** | 残る。ただし索引 14,650 件のカテゴリ内訳(記述 keyword の粗い一致)で、知識 / リサーチ系 1,906 件・メモリ / 文脈系 1,409 件・ワークフロー系 602 件と**既に埋まった**。「知識を売る」は空席ではなく、中身の差でしか勝てない |
| **d 軸(human-in-the-loop)** | 残る、かつ唯一未実装。索引の価格は**中央値 $0.01 / p90 $0.15**(tsuji の $0.10 は p85 付近、$1.00 は上位 2.8%)。$400-1,000/h は 1 セント市場の外側にあり、この分布と競合しない ── **唯一「値付けで殴られない」軸** |
| **観察装置** | 残った(実証済)。5/11 に常設化した `npm run metrics` / `npm run wallet` が 3 ヶ月間触らずに動き、本日の判定を 2 コマンドで出した。tsuji の最大の残存資産は endpoint ではなくこれ |

## 5. 次の手(順序つき)

| # | 手 | 誰 | コスト | 前提 |
|---|---|---|---|---|
| 1 | **自己送金 1 件で要件① を通す**(`docs/phase1-self-verify-runbook.md`、§6 を追記済) | 永井 | $0.11 + 15-30 分 | **なし。Cloudflare Virtual Wallet を待つ必要はない**(既存 Coinbase Smart Wallet で足りる) |
| 2 | 要件② のメタデータ追加(`inputSchema` / 出力例) | Claude が差分、永井が deploy | 4 endpoint × 数行 | 1 の結果を見てから(1 が通れば掲載され、何が足りないかが索引側で観測できる) |
| 3 | `@x402/hono` v2 移行の是非判断 | 永井 | 半日 | **1・2 の後。** Monetization Gateway が GA になれば移行そのものが不要になりうるので、先に走らない |
| 4 | Gateway waitlist 選定連絡の監視 | 永井(受信) | ゼロ | 登録済(8/7) |

**3 を 1 より先にやらない**のが要点。呑まれる予定の層に半日投じる前に、$0.11 で掲載ゲートを試す方が順序として安い。

## 6. 負け条件

- 2026-11-11 までに wallet へ AI エージェント由来の着金が 1 件でも発生したら、§1 の「到達は支払いの先行指標ではない」という構造判定は誤り。確認 = `npm run wallet` + `npm run metrics 90d`
- 手 1 を実行しても Bazaar に載らなかった場合、§3 要件① の理解が誤り(または要件② が必須要件)。確認 = 掲載チェック(runbook §6)

## 関連

- `docs/phase1-self-verify-runbook.md` ── 手 1 の実施手順(§6 に Bazaar 掲載確認を追記)
- `CLAUDE.md` 8/6-8/7 entry ── Cloudflare Wallets handle `nagai` 予約 + Gateway waitlist 登録
- `docs/x402-endpoint-design.md` ── 呑まれた層の設計図(historical record として残す)
- `docs/mcp-server-design.md` ── 有料 MCP ツール構想(Gateway が MCP ツール課金に対応したので再読の価値あり)

## 出典

- [Linux Foundation: x402 Foundation 運用開始](https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications)(2026-07-14、Premier 17 社)
- [Cloudflare: Announcing the Monetization Gateway](https://blog.cloudflare.com/monetization-gateway/)(2026-07-01)
- [Cloudflare: AI エージェントに identity と wallet](https://www.cloudflare.com/press/press-releases/2026/cloudflare-gives-ai-agents-an-identity-and-a-wallet/)(2026-08-04)
- [Stripe Docs: M2M 決済](https://docs.stripe.com/payments/machine) / [Stripe Roadmap](https://stripe.com/roadmap)(x402・MPP、公開プレビュー、targetDate 2026-07-01 ── 生 HTML の埋め込み JSON で照合)
- [Stripe + Tempo: Machine Payments Protocol](https://stripe.com/blog/machine-payments-protocol)(2026-03-18)
- [x402 Bazaar 掲載要件](https://docs.cdp.coinbase.com/x402/seller/get-discovered)
- [x402 Adoption Tracker](https://majormatters.co/x402)(2026-06-26 時点)
- [200M transactions later, the real volume is still tiny](https://finance.yahoo.com/markets/crypto/articles/x402-foundation-activated-27-old-152440828.html)(2026-08-05、「more than 95% of that activity is protocol signaling」)
- npm: `x402@1.2.0`(2026-04-16 最終)/ `@x402/core@2.21.0`・`@x402/hono@2.21.0`(2026-08-04)
