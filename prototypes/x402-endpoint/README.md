# tsuji x402 endpoint(Phase 0 prototype)

Takuya Nagai 永井ホールディングス 12 番目子プロジェクト「辻」 の x402 Payment Receiver endpoint。 Cloudflare Workers + Hono + x402 middleware で実装、 jphfa anchor(zenn.dev/jphfa)整合のフリーミアム + シグナル宣言 form。

## What

5/9 結晶物 6 軸統合 infrastructure の Phase 1 prototype。 詳細: [`~/MyWorkspace/tsuji/CLAUDE.md`](../../CLAUDE.md)

- 無料 endpoint: `/x402/skill-catalog` + `/x402/brand-fact`(human + AI agent)
- プレミアム endpoint: `/x402/premium/skill-call`($0.10)+ `/x402/premium/memory`($0.05-0.50)(AI agent only)
- 全 response に x402 シグナルヘッダー付与(`X-Payment-Required: x402`、 jphfa anchor)
- Discovery: `/llms.txt` + `/.well-known/agentic-capabilities.json`

## Status

Phase 0 prototype:

- ✅ Hono + Cloudflare Workers structure
- ✅ AI agent User-Agent 検出
- ✅ x402 シグナル宣言 middleware
- ✅ 無料 endpoint 2 件(Skill catalog + Brand fact)
- ✅ プレミアム endpoint 2 件(Mock = 402 placeholder、 Phase 1 で実 payment 検証 enable)
- ✅ Discovery file 2 件(llms.txt + .well-known/agentic-capabilities.json)
- ⏳ USDC wallet address(永井さま手動取得 + paste 待ち)
- ⏳ Cloudflare account / domain setup(永井さま手動 setup 待ち)
- ⏳ deploy 実行(`npm run deploy` 待ち)

## Phase 1 deploy 手順(永井さま手動 6 step、 約 30 分)

### Step 1: USDC wallet 取得(5 分、 永井さま手動)

1. App Store / Google Play で **Coinbase Wallet** インストール
2. 起動 → 「新しい wallet を作成」 → seed phrase 12 単語控える(1Password / 紙保管)
3. Settings → Network → **Base** 選択
4. wallet address(`0x...` 42 文字)コピー

### Step 2: wallet address paste(2 分、 永井さま手動 or Claude 代行)

3 file の `0x_TBD_PHASE1_GET_FROM_COINBASE_WALLET` を実 wallet address に置換:

- `src/index.ts`(`NAGAI_WALLET_BASE` 定数)
- `public/llms.txt`(該当 entry)
- `public/.well-known/agentic-capabilities.json`(`wallet.base`)
- `wrangler.toml`(`vars.NAGAI_WALLET_BASE`、 enable 後)

### Step 3: Cloudflare account 取得(5 分、 永井さま手動)

1. https://dash.cloudflare.com/sign-up で account 作成(GitHub login OK)
2. Workers & Pages plan: **Free tier OK**(月 100,000 request まで無料)

### Step 4: dependencies install + local test(3 分、 Claude or 永井さま)

```bash
cd ~/MyWorkspace/tsuji/prototypes/x402-endpoint
npm install
npm run dev  # → http://localhost:8787 で local test
curl http://localhost:8787/x402/brand-fact  # → 200 OK + JSON
curl http://localhost:8787/x402/premium/skill-call -X POST -H "User-Agent: ChatGPT"  # → 402 Mock
curl http://localhost:8787/llms.txt  # → llms.txt content
```

### Step 5: Cloudflare Workers deploy(5 分、 永井さま手動)

```bash
npx wrangler login  # ブラウザで Cloudflare account 認証
npm run deploy  # → URL: https://tsuji-x402-endpoint.{account}.workers.dev
```

### Step 6: Custom domain 設定(10 分、 永井さま手動 + DNS 設定)

`api.takuyanagai0213.com` を Cloudflare Workers に向ける:

1. Cloudflare Dashboard → Domains → takuyanagai0213.com 追加(domain 取得済前提)
2. DNS 設定: `api` CNAME → `tsuji-x402-endpoint.{account}.workers.dev`
3. `wrangler.toml` の `[routes]` section uncomment + paste
4. `npm run deploy` で再 deploy

完了後 → https://api.takuyanagai0213.com/x402/brand-fact で確認 + GitHub README の `### Wallet(Phase 1+)` section に wallet address paste(別 PR)。

## Phase 1 → Phase 2 拡張(jphfa anchor 統合)

- D1 database で payment tracking enable
- Analytics Engine で支払いログ
- 実 x402 middleware integrate(`@coinbase/x402` install + Mock を実検証に置換)
- Solana USDC parallel support(永井さま judgment trigger)
- World ID 統合(「AI 決済の背後に実在人間」 verify)

## 関連

- [`~/MyWorkspace/tsuji/CLAUDE.md`](../../CLAUDE.md) — tsuji main CLAUDE.md
- [`~/MyWorkspace/tsuji/docs/x402-endpoint-design.md`](../../docs/x402-endpoint-design.md) — Phase 1 戦略 補強済(jphfa anchor 統合)
- [[thought_x402_protocol_for_solo_compound_2026_05_09]] — primary source thought
- [[thought_jphfa_x402_implementation_anchor_2026_05_09]] — Phase 1 戦略 大幅補強 anchor
- [x402 official docs](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 Foundation](https://www.x402.org/)
- [Hono](https://hono.dev/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
