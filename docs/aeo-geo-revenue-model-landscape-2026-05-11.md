# AEO / GEO 収益モデル landscape 2026-05-11 cap stone

AEO(Answer Engine Optimization)/ GEO(Generative Engine Optimization)= AI 経由で content / endpoint が citation される時の収益モデルが、 どこまで標準化進行中か / 個人 publisher / supplier が今 どの path で収益化できるか の現状 fact 集約。 tsuji Phase 2 trigger 第 1 段達成(deploy 後 19 時間で純粋自律 AI crawler 第 1 号 reach、 2026-05-10 18:17 JST)直後の cap stone reflection。

## 1 行 thesis

AEO / GEO 収益モデルは **「一部実装済 + 一部議論中」 の混在状態**。 直接課金 path(x402 protocol)が標準化進行中、 Publisher-AI license deal は大手限定、 Sponsored citation は試験段階、 Pay-per-crawl は Cloudflare 経由で個人も設定可能。 個人 publisher / supplier の現実的収益化 path = **直接 endpoint × x402 + brand awareness 経由 lead gen + ツルハシ売り(教える / 仕込み方コンテンツ)+ コンサル / 業務委託**の組み合わせ、 残 path はエコシステム成熟待ち。

## 現状存在 4 軸(物理化済 / 既 deploy)

### 1. 直接課金 path(x402 protocol)

| 軸 | 内容 |
|---|---|
| 状態 | ✅ 標準仕様化進行中(Coinbase 2025-10、 Linux Foundation 2026-03 移管)|
| 物理証拠 | tsuji 6 endpoints live(<https://tsuji-x402-endpoint.nagataku021.workers.dev>)、 Anthropic / Cloudflare / AWS / Stripe / Shopify 参画、 transaction +10,000% / 月、 Cyber Week 2025 AI-driven $67B(全 digital orders 20%) |
| 収益形態 | $0.01-1.00 USDC / endpoint call、 endpoint 提供者が直接受け取る、 Base mainnet USDC 経由 |
| 個人参入 | ✅ Cloudflare Workers + Hono + x402-hono middleware + Coinbase Smart Wallet で 1 日完走可能 |
| 限界 | AI agent x402 対応はまだ OpenAI 系一部のみ、 ChatGPT / Claude / Perplexity の標準 client 実装途上、 全面課金 = 鎖国状態(jphfa anchor「導入 3 日で課金停止」 fact)→ フリーミアム + シグナル宣言 default 推奨 |

### 2. Pay-per-crawl(Cloudflare 2025-07 launch)

| 軸 | 内容 |
|---|---|
| 状態 | ✅ AI クローラーへのアクセス課金 product launch(2025-07)、 全 free tier で AI bot block default |
| 物理証拠 | Cloudflare paid tier で pay-per-crawl 設定可能、 ClaudeBot / GPTBot / Perplexity / Bytespider 等を Cloudflare 識別済 list で管理 |
| 収益形態 | HTTP 402 status + 価格設定、 pre-payment / settled-after pay-per-crawl |
| 個人参入 | ✅ 設定 OK、 ただし AI bot 側 pay 同意率次第(crawl skip / 別 source へ移動 risk) |
| 限界 | 多くの AI bot は当面 free crawl 期待、 paid crawl 同意率は未知数、 ecosystem 成熟待ち |

### 3. Publisher-AI 直接 license deal

| 軸 | 内容 |
|---|---|
| 状態 | ✅ OpenAI が大手 publisher と直接 license 契約(NewsCorp / Financial Times / Axel Springer / Le Monde / Vox Media / Time 等、 2024-2025 で数十契約) |
| 物理証拠 | 数百万-数千万 USD / 年 規模、 NYT vs OpenAI 訴訟は別途、 大手メディアが交渉 leverage 持つ |
| 収益形態 | 固定額 license + content access + 引用形態合意 |
| 個人参入 | ⚠️ **大手 publisher 限定、 個人ほぼ不可**(ただし Substack / Medium 等 platform 経由間接 path 候補)|
| 限界 | 個人 / 中小メディアには直接 deal なし、 platform 経由 license 配分も不透明 |

### 4. Sponsored citation(Perplexity / Google AI Overview 試験段階)

| 軸 | 内容 |
|---|---|
| 状態 | ⚠️ 試験段階、 Perplexity「Sponsored Questions」(2024-Q4 開始)、 Google AI Overview ads(2025 試験) |
| 物理証拠 | Perplexity Sponsored Questions = brand が「user 質問を sponsor」 する form、 売上発生 |
| 収益形態 | CPC / CPM / sponsored citation impression |
| 個人参入 | ⚠️ 個人参入 path 未明、 advertiser 側として購入は可能 |
| 限界 | 標準化前、 各 provider 独自実装、 個人 supplier の収益化 path として未確立 |

## エコシステム議論中 5 軸(未確立)

### 1. content licensing standardization

Anthropic / OpenAI / Google + IAB Tech Lab(広告業界標準化団体)で議論中。 「公平な crawl + citation 収益分配」 model proposal、 ただし draft 段階。 2-3 年 candidate。

### 2. robots.txt 拡張(llms.txt / agentic-capabilities.json)

llms.txt 標準提案(個人初出 2024、 業界拡散 2025)、 tsuji も実装済(`<https://tsuji-x402-endpoint.nagataku021.workers.dev/llms.txt>` + `/.well-known/agentic-capabilities.json`)。 AI 経由でのみ access 可能 endpoint 明示、 価格 / scope / 認証 method 開示。 standard formalization 進行中、 各 provider 対応進度ばらつき。

### 3. Visa Intelligent Commerce / Mastercard Agent Pay

✅ launch 済(Visa 2025-Oct、 Mastercard 2025-Nov)。 Visa 100+ partners、 hundreds of agent-initiated transactions。 AI agent が card 経由で commerce 実行する infrastructure、 publisher 側 endpoint への支払い経路。 ただし**個人が直接受け取る form は引き続き x402 / direct USDC が主軸**。

### 4. AI Search ads market emergence

Forrester 予測:AI search ads 市場 2030 年 $20B+、 SEO ads 市場の 30% に到達。 Gartner 予測:AI agent commerce 市場 2030 年 $3-5T(direct + indirect)。 議論軸 = 収益分配 model、 publisher / advertiser / AI provider 三層構造、 attribution + privacy 規範。

### 5. W3C / IETF + Linux Foundation 標準化

x402 = Linux Foundation 移管(2026-03)、 標準化 working group 発足。 W3C HTTP 402 status code 復活議論、 IETF agentic web protocols draft。 AI agent commerce の OS-level infrastructure 標準化、 2-3 年 candidate。

## 議論されているが未確立な「empty zones」

ecosystem の hot zone(early adopter advantage 強い領域):

- **「AI が引用したら原典に自動対価」 mechanism**(議論中、 未確立)
- **Citation chain attribution**(AI A → AI B → User の chain 内で原典への royalty 配分)
- **Memory / Context licensing**(AI 学習データ vs AI 推論 context の権利区別)
- **個人 publisher endpoint 経由の micropayment 自動 wallet**(x402 が大半、 非 crypto path も議論中)
- **AI provider と publisher 間の事前 deal 不要 form**(直接 endpoint × x402 が現状の path)

これらの empty zones に早期実装する個人 publisher が、 標準化が来た時の「先行 implementer position」 を取れる candidate。

## 個人参入 path 7 軸 mapping

| Path | 状態 | 個人参入可能性 | 関連 anchor |
|---|---|---|---|
| **A. 直接 endpoint × x402 pay-per-call** | ✅ 物理化済 | tsuji 1 日完走実績(2026-05-09 → 5/10) | tsuji `prototypes/x402-endpoint/` |
| **B. Pay-per-crawl(Cloudflare)** | ✅ 設定可能 | AI bot 同意率次第、 試行 candidate | Cloudflare paid tier 機能 |
| **C. Publisher license deal** | ✅ 大手限定 | 個人ほぼ不可 | OpenAI / NewsCorp 等 |
| **D. Sponsored Questions** | ⚠️ 試験段階 | 個人参入未明 | Perplexity Sponsored Questions |
| **E. brand awareness → 間接 path** | ✅ 既物理化 | AEO Phase 1 個人達成済(niche query で TOP/UNIQUE citation) → lead gen → コンサル / メンバーシップ / 業務委託 | AEO 最適化、 物語フック form、 連載シリーズ |
| **F. consulting / 業務委託(AEO 実装経験)** | candidate | 高単価コンサル material(時給 ¥40,000-100,000) | AEO/GEO 実装経験 = 業界 sparse position |
| **G. ツルハシ売り(教える / 仕込み方コンテンツ)** | ✅ 既物理化 | メンバーシップ / 連載シリーズ / 単発有料 | brand thesis「AI 時代の生き方を示す」 |

つまり**現状の現実的収益化 path = A + E + F + G の組み合わせ**(既物理化 / 物理化中)、 残 B / C / D はエコシステム成熟待ち。

## tsuji 物理化済軸(implementation reference)

tsuji repo は path A(直接 endpoint × x402 pay-per-call)の **個人 supplier 実装 reference** として deploy 済:

- 6 endpoints live: `/x402/skill-catalog` / `/x402/brand-fact` / `/x402/premium/skill-call` / `/x402/premium/industry-fact` / `/x402/premium/workflow-template` / `/x402/premium/memory`
- supply 軸 mapping:
  - a. Discovery / Knowledge → `/x402/premium/industry-fact`($0.10 / call、 6 topics)
  - b. Skill execution / Replicate → `/x402/premium/workflow-template`($1.00 / call、 5 templates)
  - c. Memory query / Context retrieve → `/x402/premium/memory`($0.05 / call、 10 excerpts)
  - d. Consulting / Decision support → Phase 2 candidate(human-in-the-loop)
- 監視装置:Analytics Engine binding + middleware で全 endpoint access の datapoint 自動書き込み + `npm run metrics` 集計 script
- Phase 2 trigger 第 1 段達成:deploy 後 19 時間で純粋自律 AI crawler 第 1 号 reach 物理証拠取得(2026-05-10 18:17 JST、 5 bucket 切り分け方法論 anchor 化済)

## 「収益モデル不確定」 = ツルハシ戦略 hedge logic 整合

収益モデル未確立 fact = ツルハシ戦略 hedge logic の core 補強:

- **本業 path**(金を掘る側、 直接課金 + アフィリ + 業務委託)= AEO/GEO 早期 adopter として直接収益化
- **ツルハシ売り path**(教える / 仕込み方)= 「収益モデル未確立 fact」 自体が flagship 級コンテンツ candidate、 連載シリーズ + 業務委託営業材料 + 引用 RT 軸への波及
- **3 path 並走 form**(本業 / ツルハシ売り / ゴールド掘る)が「収益モデル未確立 = 早期 adopter window」 を逆方向に活用

つまり収益モデル確定を待つ path でなく、 確定前に「本業 + ツルハシ売り + ゴールド掘る」 並走で物理化する form が早期 adopter advantage 累積。

## 関連

- `~/MyWorkspace/tsuji/CLAUDE.md` ─ tsuji 全体 anchor、 5/11 cap stone reflection row
- `~/MyWorkspace/tsuji/docs/ai-agent-commerce-landscape-2026-05-10.md` ─ 5 provider + 4 protocol fact 集約
- `~/MyWorkspace/tsuji/docs/affiliate-industry-impact-2026-05-10.md` ─ アフィリエイト業界波及 + lag 構造
- `~/MyWorkspace/tsuji/docs/x402-endpoint-design.md` ─ x402 endpoint 設計詳細
- `~/MyWorkspace/tsuji/docs/cross-flow-with-other-subprojects.md` ─ 横断 cross-flow 設計

## 経緯

2026-05-11 cap stone session で AEO/GEO 収益モデル現状 fact + エコシステム議論中軸の 7 階層議論集約(tsuji traffic 確認 → 需要予測 → 収益モデル → 二軸定義 → 歴史 pattern → 牙城議論 → 下剋上 thesis → エコシステム fact)→ 「事業の柱」 commitment anchor 引き直し → 本 doc 起票で public reference 化。 tsuji 物理化済軸(path A)+ 残 6 path mapping で個人 publisher / supplier の現実的収益化 path 集約 anchor。

once-in-a-generation moment 物理化第 14-15 段 candidate、 早期 adopter window 開放中の物理証拠 anchor として機能。
