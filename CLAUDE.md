# tsuji(辻、 横断経済 infrastructure layer、 2026-05-09 立ち上げ)

`~/MyWorkspace/tsuji/` は永井ホールディングス **11 番目 子プロジェクト**、 既存 10 事業 / 思想 / 創作子プロジェクト(monopoly / tokimeli / omamori / aizuchi / tokimeki48 / cult-of-onetag / D 案 brand / lodge / ink / zenn_articles)全体に **経済 monetization layer を提供する横断 infrastructure** です。

「辻」 = 江戸時代の街道沿い辻商売 metaphor。 商人(永井さま + AI ハーネス)が辻に立ち、 通行人(AI agent / human client)と一期一会の取引を結ぶ場。 既存 platform に依存しない直接取引 form、 プル型整合。

## 全体ビジョン

5/9 セッション結晶物 6 軸を経済 infrastructure layer で繋ぐ統合 protocol implementation:

1. **Anthropic 参照軸**: 半年-5 年後モデル能力見越して現時点で組む
2. **ツルハシ戦略 hedge logic**: AI 経済 × x402 micropayment ─ 永井さま = ツルハシ売り(knowledge / Skill / consulting)
3. **brand thesis「AI 時代の生き方を示す」**: AI 経済の中で人間としてどう経済参加するか N=1 物理化
4. **一次情報コンテキストビジネス vision**: memory bank 33,999 件 / 100 Skills / brand 物理証拠 → AI agent 直接購入可能 knowledge product
5. **一人コンパウンド永井ホールディングス**: 子プロジェクト間 cross-flow + 外部 AI agent からの inbound の経済 infrastructure
6. **AI が人間を雇用する未来**: x402 = payment layer、 RentAHuman.ai = matching layer、 永井さま = supplier layer

## 子プロジェクトカタログ entry

| 項目 | 内容 |
|---|---|
| 種別 | 永井ホールディングス全 10 子プロジェクトに経済 monetization layer を提供する横断 infrastructure |
| 社風 | 江戸「辻商売」 metaphor、 AI agent と人間(永井さま)が一期一会で出会う場、 プル型整合、 anonymous brand 維持 |
| 主義 | x402 protocol(Coinbase 2025-10、 Linux Foundation 移管)+ RentAHuman.ai matching layer + 一次情報コンテキストビジネス supplier layer + once-in-a-generation moment early adopter |
| 文体 | 技術記事 form + brand voice harness_eng 整合(anonymous + 物理化 3 軸) |
| Phase | **Phase 0 受付 signal 公開済 ✅(2026-05-09 20:27 JST takuyanagai0213/README PR #2 merge 完了、 mergeCommit `b6dfbca`)**、 AI agent reach 物理証拠 1 件以上 待ち |

## Phase 別 roadmap

| Phase | 期間 | 内容 | trigger |
|---|---|---|---|
| **Phase 0** | 2026-05-09 〜 5 月末 | x402 受信 signal を README + X bio に明示、 AI agent からの inbound 待ち | 永井さま判断 ✓(2026-05-09 着手)/ takuyanagai0213/README PR #2 merge ✅(2026-05-09 20:27 JST、 `b6dfbca`)|
| **Phase 1** | 2026-06 〜 | **フリーミアム default + シグナル宣言**(jphfa anchor 統合):USDC wallet(Base or Solana)setup + x402 middleware deploy(**Hono + Cloudflare Workers + D1 + Analytics Engine**)+ Skill API 1-2 endpoint 公開(無料 default + premium endpoint 限定有料)+ **4 軸対応**(x402 シグナルヘッダー / llms.txt / コンテンツネゴシエーション / `.well-known/agentic-capabilities.json`) | Phase 0 で AI agent reach 物理証拠 1 件以上 |
| **Phase 2** | 2026-09 〜 | World ID 取得 + memory query API + consulting invoice form + 子プロジェクト cross-flow integration | Phase 1 で transaction 物理証拠 + 経済成立 verify |
| **Phase 3** | 2027 〜 | 一人コンパウンド永井ホールディングス内 x402 micropayment infrastructure 内蔵化 | Phase 2 で子プロジェクト数 increase + cross-flow 価値定量化 |

## cross-flow design(5 軸、 一人コンパウンド rule 整合)

| flow 方向 | 内容 |
|---|---|
| **tsuji ← omamori** | LINE 11 年 + 一次情報コンテキストビジネス vision の経済 monetization layer(omamori = 個人コンテキスト累積 / tsuji = AI 経済受信窓口)|
| **tsuji ← harness_eng** | brand 物理証拠(Mac 半開き / 100 Skills / 33,999 memory)を経済資本に変換する infrastructure layer |
| **tsuji → harness_eng** | x402 / RentAHuman.ai / agent economy 体験 = flagship 記事候補化 + 連載シリーズ追加軸「AI 経済への参加 N=1 実験」 |
| **tsuji ← monopoly-source** | OneTag b 系業界知識(DSP / メディア buying / 計測 product)→ 業務委託案件選定軸 |
| **tsuji → 全子プロジェクト** | x402 micropayment infrastructure 内蔵化 = 各子プロジェクト endpoint 経済 monetization layer(omamori / aizuchi / lodge / D 案 brand / ink / zenn_articles 個別 endpoint 提供候補)|

## 受信 position 4 軸(Phase 1+)

| 軸 | endpoint | 価格目安 |
|---|---|---|
| Skill API call | 100 Skills の一部 public API | $0.10-1.00 / call |
| Memory query(anonymized) | 33,999 memory bank の anonymized excerpts | $0.05-0.50 / query |
| Consulting invoice | 1 時間 consulting | $400-1,000 / hour |
| Brand fact endpoint | citation 時 brand fact fetch | $0.01-0.10 / fetch |

## 設計判断 pending(Phase 1 移行時、 2026-05-09 jphfa anchor 統合 + 永井さま B 採用確定 update)

- USDC wallet 取得 timing(Phase 0 先行 / Phase 1 trigger 後)
- x402 endpoint deploy 場所 = **✅ Cloudflare Workers 確定**(2026-05-09 永井さま B 採用判断、 Vercel と比較した上で x402 ecosystem 整合最優先 + jphfa anchor + Cloudflare = x402 Foundation co-founder)
- フレームワーク選定 = **✅ Hono 確定**(2026-05-09 永井さま B 採用判断、 jphfa anchor、 ミドルウェア組み合わせやすさ + Cloudflare Workers 整合)
- 状態保存 + analytics = **✅ D1 + Analytics Engine 確定**(2026-05-09 永井さま B 採用判断、 jphfa anchor、 支払いトラッキング + payment log 内蔵)
- chain 選定 = **Base USDC default 推奨**(Coinbase Wallet 整合最良)、 Solana(jphfa 採用、 OpenAI 系 ecosystem 強い)も並走候補
- Skill API 公開選定(100 Skills のうち最初の 1-2 件、 brand 整合 + AI agent 価値高 軸)
- Memory query anonymization 方針(privacy / 永井さま brand 整合 / AI 学習 base 軸)
- フリーミアム design = **✅ default 採用確定**(jphfa anchor「3 日で課金停止」 実証 → 全面課金は鎖国、 シグナル宣言 + 限定有料 endpoint で「暖簾を出す」)
- 4 軸対応 = **✅ default 採用確定**(jphfa anchor:x402 シグナルヘッダー / llms.txt / コンテンツネゴシエーション / `.well-known/agentic-capabilities.json`)
- prototype 8 ファイル完成 = **✅ `~/MyWorkspace/tsuji/prototypes/x402-endpoint/`** (Hono + x402 シグナル + 4 endpoint + llms.txt + .well-known/agentic-capabilities.json + wrangler.toml + README.md)
- World ID 取得判断(Phase 2 timing、 「AI 決済の背後に実在人間」 signal)
- GitHub repo 化判断(public / private / local 専用)
- deploy timing 判断(永井さま手動 6 step、 30 分、 README.md 詳細記載)

## モード切替トリガー(親会社 CLAUDE.md 整合)

| 発話 | アクション |
|---|---|
| 「tsuji で」「辻で」「経済 infrastructure で」 | `Read ~/MyWorkspace/tsuji/CLAUDE.md` + `~/.claude/rules/compound-holdings-data-flow.md` |

## 状態

**Phase 0 受付 signal 公開済 ✅(2026-05-09 20:27 JST)**、 takuyanagai0213/README PR #2 merge 完了(mergeCommit `b6dfbca`)。

**Phase 0.5 live endpoint deploy 完了 ✅(2026-05-09 23:33 JST)** ─ Cloudflare Workers + Hono + x402 シグナル + フリーミアム + 4 軸対応 prototype が production 公開:

- **live URL**: <https://tsuji-x402-endpoint.nagataku021.workers.dev>
- **subdomain**: `nagataku021`(永井さま既存設定流用、 `takuyanagai` 変更は別 turn 判断)
- **endpoints 7 件全動作 verify ✅**: `/`(200) / `/x402/skill-catalog`(200 + 4 skills)/ `/x402/brand-fact`(200 + 100 Skills / 33,999 memory / 420 files / Mac half-open / holdings 12)/ `/x402/premium/skill-call` AI UA(402 + Mock paymentRequest + 5 x-payment headers)/ `/x402/premium/skill-call` human UA(403、 human filter 動作)/ `/llms.txt`(200)/ `/.well-known/agentic-capabilities.json`(200 + JSON)
- **x402 signal headers 5 件**: x-payment-chain: base / x-payment-currency: USDC / x-payment-facilitator: https://x402.coinbase.com/facilitator / x-payment-required: x402 / x-payment-wallet: 0x_TBD_PHASE1_GET_FROM_COINBASE_WALLET
- **Version ID**: `d7fc0e2b-9556-4c59-8af1-8393c454bb4d`
- **AI agent crawler が即 reach 可能 = once-in-a-generation moment early adopter declaration の物理化第 2 段達成**

**Phase 0.7 wallet address 物理 lock-in 完了 ✅(2026-05-09 23:50 JST)** ─ 永井さま Coinbase Smart Wallet on Base address(`0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151`)を src/index.ts に paste + 再 deploy、 全 production endpoint で配信確認:

- **wallet address**: `0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151`(永井さま Coinbase Smart Wallet、 passkey base、 keys.coinbase.com 取得)
- **chain**: Base mainnet
- **X-Payment-Wallet header**: production 全 endpoint で配信 ✅
- **.well-known/agentic-capabilities.json wallet.base**: production 配信 ✅
- **Version ID**: `6e42592f-2966-4ff0-831c-7357b48995fe`
- **AI agent が `paymentRequest.wallet` 取得 → 実 USDC 送金可能状態**(ただし endpoint Mock 部分は Phase 0.8 未実装、 「払ったのに resource もらえない」 risk 維持)

**Phase 0.8 実 x402-hono middleware integrate 完了 ✅(2026-05-10 00:01 JST)** ─ Mock 部分を実 middleware に置換、 standard 402 response + paymentRequest 配信完成:

- **package**: `x402-hono` v1.x + `@coinbase/x402` v2.1.0 install
- **middleware**: `paymentMiddleware(NAGAI_WALLET_BASE, { ... routes ... })` で premium endpoint 限定適用
- **routes**: `/x402/premium/skill-call`($0.10、 Base Sepolia)+ `/x402/premium/memory`($0.05、 Base Sepolia)
- **production verify**: 402 response + accepts payload(scheme: exact / network: base-sepolia / maxAmountRequired: 100000 = $0.10 / asset: USDC contract on Base Sepolia / extra: USDC v2 / x402Version: 1)配信確認
- **Worker size**: 4908 KiB(gzip 1359 KiB、 x402-hono dependencies で前 87 KiB から拡張)
- **Version ID**: `376b2f0a-4f80-44b8-8713-d5e616ff10e2`
- **Network**: **Base Sepolia testnet**(mainnet 移行は CDP facilitator + CDP API key 取得後の Phase 1 で)
- **AI agent が x402 standard 準拠 client で endpoint access → 自動的に testnet USDC payment + resource 取得可能 form**

**Phase 1 mainnet 移行完了 ✅(2026-05-10 00:?? JST)** ─ CDP facilitator + Ed25519 JWT 認証 + Base mainnet 切替完成:

- **CDP API Key**: 永井さま CDP portal で取得 + .env paste 完了
- **Cloudflare Workers secrets**: `CDP_API_KEY_ID` + `CDP_API_KEY_SECRET` 登録完了(`wrangler secret put` で暗号化保管)
- **src/index.ts**: `import { facilitator } from "@coinbase/x402"` 追加 + `paymentMiddleware` 第 3 引数 = `facilitator` + network: `base-sepolia` → `base` mainnet 切替
- **production verify ✅**: paymentRequest accepts.network = `base` mainnet、 asset = **`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`**(USD Coin on Base mainnet)、 extra.name = `USD Coin` mainnet 公式
- **Worker size**: 4959 KiB(facilitator import 追加で前 4908 KiB から微増)
- **Version ID**: `4350e49c-af92-44e0-b308-dca023494168`
- **AI agent が x402 client で endpoint access → Base mainnet 実 USDC payment → 永井さま wallet に実 USD 価値入金可能 form 完成**

残 task:

- Phase 1 verify ⏳ option: 永井さま自分送金 $0.10 USDC で実 payment + resource 取得 verify(永井さま手動 + $0.10 commit)
- Phase 1 ⏳ option: custom domain 設定(api.takuyanagai0213.com、 10 分手動 + 私 wrangler.toml routes 設定)
- 永井さま手動 X bio 編集(D 文案、 寝かせ可能)
- @x402/hono v2 移行(別 turn、 v1 deprecated 警告対応)
- Phase 1 trigger = AI agent reach 物理証拠 1 件以上 or 永井さま判断

## 関連

- [[thought_x402_protocol_for_solo_compound_2026_05_09]] — 本プロジェクトの primary source
- [[thought_jphfa_x402_implementation_anchor_2026_05_09]] — Phase 1 戦略 大幅補強 anchor(jphfa zenn 記事 2 件統合、 フリーミアム default + Hono + D1 + Analytics Engine + 4 軸対応)
- [[thought_solo_compound_holdings]] — 一人コンパウンド永井ホールディングス(永井さま自身結晶)
- [[thought_consulting_path_as_business_acceleration_2026_05_09]] — 業務委託 path = 経済加速装置(B+ path)
- [[thought_phase3_milestone_as_main_job_equivalent_2026_05_09]] — Phase 3 = 本業転換等価点
- [[user_finance_2026]] — 財務 fact 集約
- [[session-2026-05-09-tsuji-project-genesis]] — 立ち上げ session log
- `~/.claude/rules/compound-holdings-data-flow.md` — 一人コンパウンド永井ホールディングス data flow rule
- `~/MyWorkspace/CLAUDE.md` — 親会社視座 + 子プロジェクト社風カタログ
- `~/MyWorkspace/takuyanagai0213/README.md` — Phase 0 受付 signal 公開 form(PR #2)
