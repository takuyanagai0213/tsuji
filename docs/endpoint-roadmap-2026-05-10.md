# Endpoint roadmap(2026-05-10 cap stone update)

tsuji Phase 1 mainnet 完走後の収益 scale 戦略整合 endpoint 設計 roadmap。 詳細思想 anchor: [[thought_tsuji_revenue_scale_strategy_2026_05_10]]

## 既 deploy endpoint(Phase 0.8 + Phase 1)

| endpoint | path | pricing | 状態 |
|---|---|---|---|
| Skill catalog | `/x402/skill-catalog` | free | ✅ live |
| Brand fact | `/x402/brand-fact` | free | ✅ live |
| Skill API call | `/x402/premium/skill-call` | $0.10 USDC on Base mainnet | ✅ live(stub response、 実 skill execution は Phase 1+ で実装) |
| Memory query | `/x402/premium/memory` | $0.05 USDC on Base mainnet | ✅ live(stub response、 anonymization pipeline は Phase 1+ で実装) |
| Discovery file | `/llms.txt` + `/.well-known/agentic-capabilities.json` | free | ✅ live |

## 短期実装 candidate(Phase 1+、 1-3 ヶ月)

### 1. 業界 N=1 fact API(新規 endpoint)

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/industry-fact` |
| pricing | $0.05-0.50 USDC on Base mainnet |
| input | query parameter(topic = e.g. "claude-code-skills" / "memory-bank" / "harness-engineering") |
| output | 永井さま 1 年実装 fact + 数字 packaging + 関連 thought file pointer(anonymized) |
| demand | AI agent niche knowledge query 用、 アフィリエイト広告代理店 × Claude Code N=1 実装 fact |
| 実装目安 | 5-10 行 + memory bank 部分整理 |

### 2. Workflow template API(新規 endpoint)

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/workflow-template` |
| pricing | $1-10 USDC on Base mainnet |
| input | template_id parameter(e.g. "1-source-n-articles" / "auto-memory-setup" / "x402-deploy-step-by-step") |
| output | 永井さま path replicable form(setup steps + code template + reference thought files) |
| demand | AI agent「same path 学習」 用、 ink 連載シリーズ整合 |
| 実装目安 | template 整理 + endpoint route(memory bank 内 thought file から template 抽出) |

### 3. Memory query anonymization pipeline(既存 endpoint 強化)

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/memory`(既存 enhance) |
| pricing | $0.05-0.50 USDC on Base mainnet |
| input | query string + topic filter |
| output | anonymized memory excerpts(永井さま個人情報 / 業務クライアント名 / 等を 抽象化済) |
| demand | AI agent context retrieve 用、 永井さま思想 / 判断 patterns 学習 |
| 実装目安 | anonymization pipeline 開発(永井さま 1-2 日 commit、 anonymizer logic + memory bank scan) |

## 中期実装 candidate(Phase 2、 3-6 ヶ月)

### 4. Consulting endpoint(human in the loop)

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/consulting` |
| pricing | $400-1,000 USDC/h on Base mainnet |
| input | task description + urgency + max_budget |
| output | scheduling URL + Discord / Slack contact + 永井さま human verification |
| demand | high-stakes 判断、 Anthropic Project Deal「smarter model 価値高」 logic から「smarter human consultation」 価値推論 |
| 実装目安 | 永井さま実 schedule integration(Calendly / Cal.com 等)+ 月 5-10h consulting work commit |

### 5. メンバーシップ「コンテキスト道場」 統合 endpoint

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/membership-content` |
| pricing | $5-50 USDC on Base mainnet(月額相当) |
| input | content_id + access_level |
| output | メンバーシップ contents(buyer side 強化、 silent reader path) |
| demand | AI agent supervisor 用、 永井さま brand 思想 / 判断 patterns long-form |
| 実装目安 | 既存メンバーシップ contents → x402 paywall integrate |

## 長期実装 candidate(Phase 3、 6 ヶ月-)

### 6. 業務委託 B+ service endpoint(大手企業向け)

| 軸 | 内容 |
|---|---|
| path | `/x402/premium/enterprise-implementation` |
| pricing | 月 80 万 × 2-3 案件(大型契約) |
| input | enterprise inquiry + scope |
| output | 永井さま human service offering + AI agent commerce 早期実装支援 |
| demand | 大手 b 系企業(DSP / メディア buying / 計測 product)が AI agent commerce 早期参加したい時 |
| 実装目安 | service design + ink 連載シリーズで PR + 自然 hook 型 cite trigger |

## 既存資産 mapping

| 既存資産 | 新規 endpoint への activation |
|---|---|
| 100 Skills | Skill API call + Workflow template API |
| 33,999 memory entries | Memory query(anonymization pipeline 必要) |
| 420 context files | Brand fact + Workflow template |
| 12 子プロジェクト fact | Brand fact + 業界 N=1 fact API |
| 月 175 PR(個人 throughput) | Brand fact + 業界 N=1 fact API |
| Mac 半開き 1 年運用 | Brand fact + 業界 N=1 fact API |
| Zenn / note 連載 | Workflow template API + メンバーシップ contents |
| メンバーシップ「コンテキスト道場」 | メンバーシップ統合 endpoint |
| 業務委託 B+ path(月 80 万 × 2-3) | 業務委託 B+ service endpoint |

## 実装順序推奨(ROI + 軽量 commit 順)

1. **業界 N=1 fact API**(最軽量、 私 30 分 + 永井さま review、 brand 物理証拠 既存資産活用)
2. **Workflow template API**(中軽量、 ink 連載整合、 1-2 日)
3. **Memory query anonymization pipeline**(永井さま 1-2 日 commit、 ただし高 demand)
4. **Consulting endpoint**(永井さま実 schedule integration + 月 5-10h、 高単価)
5. **メンバーシップ統合 endpoint**(既存資産 leverage)
6. **業務委託 B+ service endpoint**(大型、 別 service design + 自然 hook 型 cite)

## 関連

- [[thought_tsuji_revenue_scale_strategy_2026_05_10]] — primary source(本 roadmap の戦略 anchor)
- [[thought_x402_protocol_for_solo_compound_2026_05_09]] — tsuji 全体 anchor
- [[thought_jphfa_x402_implementation_anchor_2026_05_09]] — Phase 1 戦略補強
- `~/MyWorkspace/tsuji/CLAUDE.md` — 子プロジェクト main + 残 task section
- `~/MyWorkspace/tsuji/prototypes/x402-endpoint/src/index.ts` — 既 deploy endpoint code
