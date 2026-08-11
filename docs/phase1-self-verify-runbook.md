---
title: "Phase 1 自己 verify Runbook ─ $0.10 USDC 自己送金 end-to-end test"
status: ready_for_owner_trigger
created: 2026-05-13
purpose: Phase 1 mainnet 完全動作物理証拠取得(段 2 / 段 3 同時 trigger)
estimated_cost_usd: 0.10 + Base mainnet gas (約 0.01 USD = $0.11 total)
estimated_time_minutes: 15-30
trigger_owner: 永井(手元 $0.10 commit 必要、 私(Claude) は document + verify command 整備のみ)
---

# Phase 1 自己 verify Runbook

## 目的

tsuji x402 endpoint Phase 1(2026-05-10 mainnet deploy 完成)を **end-to-end で動作確認** するため、 永井さま自身が premium endpoint に **$0.10 USDC 自己送金** を実行する。

達成軸:

1. **段 2 経済成立 verify**: premium endpoint で 402 signal → 200 完了 transition 物理証拠
2. **段 3 wallet 着金 verify**: USDC mainnet wallet (`0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151`) への着金 物理証拠
3. **Phase 2 trigger 第 2 段達成**: 「reach はあるが経済成立はゼロ」 中間段階を 「reach + 経済成立」 完成段階に格上げ
4. **brand 物理証拠**: once-in-a-generation moment 物理化第 16 段達成 candidate
5. **公式ディスカバリ層(x402 Bazaar)の掲載要件を通す**(2026-08-11 追加、§6 参照)

### 2026-08-11 追記 ── この runbook の意味が変わった

作成時(5/13)の価値は「配管の疎通確認」だった。$0.11 の自己 test なので 3 ヶ月繰り延べられた。

その間に判明した事実(`docs/2026-08-11-discovery-gap-and-absorbed-layers.md`):**x402 Bazaar の掲載要件は「CDP Facilitator 経由の課金成功 1 件」であり、tsuji は索引 14,650 件に不在**。つまり本 runbook は疎通確認ではなく **掲載ゲートの通過手段**になった。発見されるには 1 回売れている必要があり、売れるには発見されている必要がある ── この鶏卵を $0.11 で破る手が、既に書かれた状態で 3 ヶ月置かれていた。

**Cloudflare Virtual Wallet の提供開始を待つ必要はない**(2026-08-04 発表分はハンドル予約のみ稼働)。本 runbook は既存の Coinbase Smart Wallet で完結する。

## Pre-condition check(5 分)

### 1. wallet 状態確認

```bash
# tsuji wallet 残高確認(空でも OK、 着金確認用)
cd ~/MyWorkspace/tsuji/prototypes/x402-endpoint
npm run wallet
# 期待: 段 3 未達 = 0 件、 これが test 後に 1 件以上になる
```

### 2. endpoint health check

```bash
# premium endpoint が 402 を正しく返すか確認
curl -sS -i -A "MyTestAgent/1.0" \
  "https://tsuji-x402-endpoint.nagataku021.workers.dev/x402/premium/skill-call?skill_id=description-quality"

# 期待出力(headers):
# HTTP/1.1 402 Payment Required
# x-payment-required: x402
# x-payment-chain: base
# x-payment-currency: USDC
# x-payment-wallet: 0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151
# x-payment-facilitator: https://x402.coinbase.com/facilitator
#
# Body には accepts payload (network: base, payTo: 永井さま wallet, asset: USDC mainnet)
```

### 3. Coinbase Smart Wallet ready check

- Coinbase Wallet app (browser extension / mobile) で永井さま wallet (`0x4d08...`) にログイン済か
- Base mainnet network 選択済か
- USDC 残高が **$0.20 以上** 保有か($0.10 送金 + Base mainnet gas $0.01 余裕分)

USDC 残高不足の場合:
- Coinbase Exchange から Base mainnet 経由 deposit
- または別 chain から bridge(Stargate / Across 等)

## 手順(15-30 分、 永井さま手元)

### Step 1: x402 client tool 起動(候補 2 path)

#### Path A: Coinbase x402-fetch CLI(推奨)

```bash
# 公式 x402 client
npx --yes @coinbase/x402-fetch \
  --url "https://tsuji-x402-endpoint.nagataku021.workers.dev/x402/premium/skill-call?skill_id=description-quality" \
  --wallet-key "$COINBASE_WALLET_PRIVATE_KEY"  # ※注意: private key 取扱
# または
# --wallet-connect 形式で wallet 接続
```

注意: private key 直叩きは security 観点で慎重に。 一時 wallet で test も 1 案。

#### Path B: manual curl + signed payment(技術検証向け)

x402 protocol 仕様に沿って手動で `X-Payment` header 付与 + USDC transfer signed message を生成。 詳細仕様: [coinbase/x402 公式 docs](https://github.com/coinbase/x402)

### Step 2: 送金実行 + endpoint 応答取得

期待 transition:

```
Request 1: GET /x402/premium/skill-call?skill_id=description-quality
Response 1: HTTP 402 Payment Required + accepts payload

[x402 client が USDC transfer を Base mainnet で実行、 signed payment header を生成]

Request 2: GET /x402/premium/skill-call?skill_id=description-quality
           X-Payment: <signed payment header>
Response 2: HTTP 200 OK + skill content payload
```

### Step 3: 段 2 verify(endpoint metrics)

送金成功 1-2 分後(Analytics Engine の rollup latency):

```bash
cd ~/MyWorkspace/tsuji/prototypes/x402-endpoint
npm run metrics 1h
```

期待 fact(段 2):

- section 4.5「Premium endpoint payment flow」:
  - `path=/x402/premium/skill-call status=402` 1 件以上(初回 request)
  - `path=/x402/premium/skill-call status=200` 1 件以上(payment 後 retry success)
- → 段 2 経済成立 verify ✅ 達成

### Step 4: 段 3 verify(wallet 着金)

```bash
npm run wallet
```

期待 fact(段 3):

- ERC-20 transfer 件数: 1 件以上
- 内容: $0.10 USDC を 永井さま wallet → 永井さま wallet (自己送金)
- → 段 3 wallet 着金 verify ✅ 達成

加えて、 Base block explorer (BaseScan) で直接確認:

```
https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913?a=0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151
```

(USDC contract on Base mainnet × 永井さま wallet address)

## Rollback path

### 送金失敗 case

| 症状 | 対処 |
|---|---|
| Gas 不足 | Base mainnet で gas 用 ETH を deposit(0.001 ETH 程度) |
| USDC 残高不足 | Coinbase Exchange から deposit |
| facilitator response 失敗 | CDP API Key validity verify(`wrangler secret list` で `CDP_API_KEY_ID` / `CDP_API_KEY_SECRET` 確認)、 期限切れなら CDP portal で再発行 |
| x402 client error | x402-hono middleware の version 確認、 `npm outdated` で更新候補 |

### endpoint 側 issue case

| 症状 | 対処 |
|---|---|
| 402 ではなく 5xx 返却 | `wrangler tail` で realtime log 確認、 Worker crash 系なら最新 Version ID rollback |
| metrics に反映されない | Analytics Engine rollup latency(数分 wait)、 timestamp filter で再 query |
| wallet 着金 query が空 | Blockscout API rate limit / Base mainnet finality 待ち(数秒-数十秒)、 BaseScan 直接確認 |

### 完全 rollback case(test 失敗 + 戻したい)

- 送金 transaction は on-chain で取り消し不可、 ただし自己送金なので **net 出費 = gas 分のみ**($0.01 程度)
- endpoint 側に状態変化なし(stateless middleware)、 Worker rollback は不要

## 期待 fact 全体

test 成功時:

- 段 1 reach signal: 既存 23 件 + 本 test request 2 件追加(初回 402 + payment 後 200)
- 段 2 payment intent: **402 signal 1 件 + 200 完了 1 件 = 初の経済成立物理証拠**
- 段 3 wallet 着金: **ERC-20 transfer 1 件 = USDC mainnet 着金物理証拠**

= **Phase 2 trigger 第 2 段達成 + Phase 1 完成 verify + once-in-a-generation moment 物理化第 16 段**

## 後続 action(test 成功後)

1. **brand 燃料化 trigger**: ink/drafts/2026-05-13-x402-crawler-reach-fact.md(PR #66)の publish trigger condition 2 件(段 2 + 段 3)全達成、 本文展開 phase 移行 候補
2. **session log 化**: `~/.claude/projects/-Users-nagaitakuya-MyWorkspace-tsuji/memory/session-2026-05-13-phase1-self-verify.md` で物理証拠保存
3. **tsuji CLAUDE.md update**: Phase 1 「verify 完了」 status 反映、 残 task list の「Phase 1 verify ⏳」 を ✅ 化
4. **AI agent 自然 reach 待ち**: 自己 verify 完了後、 真の物理証拠軸 = 「他者 AI agent が x402 client 経由で reach + 経済成立」 fact 取得待ち、 Phase 2 trigger 完全達成への次 milestone

## 6. Bazaar 掲載 verify(2026-08-11 追加)

段 2 / 段 3 が通ったら、**公式ディスカバリ層に載ったか**を確認する。索引反映には facilitator 側の遅延があるので、送金直後と翌日の 2 回見る。

### 掲載チェック(認証不要、読み取りのみ)

```bash
# 全 14,650 件を走査して自分の endpoint / wallet を探す
python3 - <<'PY'
import json, urllib.request
base = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources"
items = []
for off in range(0, 30000, 1000):
    with urllib.request.urlopen(f"{base}?limit=1000&offset={off}", timeout=60) as r:
        d = json.load(r)
    got = d.get("items", [])
    items += got
    if len(items) >= d["pagination"]["total"] or not got:
        break
blob = json.dumps(items).lower()
print("索引総数:", len(items), "/ declared", d["pagination"]["total"])
for probe, label in [
    ("4d08aeb4776aa82039bba47db5d0bb5431d1c151", "tsuji wallet"),
    ("nagataku021", "tsuji host"),
    ("workers.dev", "CONTROL: 他の workers.dev 販売者"),
]:
    print(f"{label:34} -> {blob.count(probe)} hits")
PY
```

**CONTROL 行を必ず見る。** `workers.dev` が 0 なら API 側の異常か走査の不備であって「載っていない」の証拠にはならない(2026-08-11 時点の対照値は 411)。空の出力を結論に使わない。

### 判定

| 結果 | 意味 | 次 |
|---|---|---|
| tsuji wallet / host が 1 件以上 | **掲載成功。** 鶏卵を破った | 索引側に記録された自分の entry を読み、`inputSchema` / 出力例の欠落を確認して要件② を埋める |
| 0 件のまま(CONTROL は正常) | 要件① の理解が誤り、または要件② が必須要件 | `docs/2026-08-11-...` §6 の負け条件に従って判定を訂正する。**期待値の方を書き換えない** |

### 掲載後に効くこと

- 索引経由の到達は robots.txt / sitemap.xml 経由の**クローラ到達とは別経路**(§1 の実測では後者は購買に繋がっていない)
- Bazaar には「merchant address で検索」の経路があるので、wallet アドレスが恒久的な販売者 ID として働く

## 関連

- `~/MyWorkspace/tsuji/docs/2026-08-11-discovery-gap-and-absorbed-layers.md` 呑まれた層の判定 + discovery gap の実測(本 runbook の意味を変えた doc)
- `~/MyWorkspace/tsuji/CLAUDE.md` Phase 1 verify 残 task(永井さま手動 trigger 待ち)
- `~/MyWorkspace/tsuji/docs/x402-endpoint-design.md` Phase 1 戦略詳細
- `~/MyWorkspace/tsuji/docs/wallet-setup-guide.md` wallet setup 前提
- `~/MyWorkspace/tsuji/prototypes/x402-endpoint/scripts/metrics.sh` 段 2 観察 script
- `~/MyWorkspace/tsuji/prototypes/x402-endpoint/scripts/wallet-receipts.sh` 段 3 観察 script
- thought anchor: [[thought_x402_protocol_for_solo_compound_2026_05_09]] / [[thought_jphfa_x402_implementation_anchor_2026_05_09]] / [[thought_tsuji_phase2_trigger_first_segment_2026_05_10]]

## 注意事項

- private key / wallet secret は本 file に絶対書かない(.env 経由 + wrangler secret 経由のみ)
- 自己送金なので net 出費は gas 分($0.01 程度)、 心理的負担は最小
- test 失敗してもリスク低(stateless middleware + on-chain 自己送金 = wallet 内残高循環のみ)
- timing: 永井さま余白 + トキメキ駆動 で trigger、 急がない(`Leave flowers for tomorrow.` 整合)
