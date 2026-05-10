#!/usr/bin/env bash
#
# tsuji x402 endpoint Analytics Engine 集計 script
#
# Usage:
#   npm run metrics              # default period = 24h
#   npm run metrics -- 1h
#   npm run metrics -- 7d
#   npm run metrics -- 30d
#
# 5/16 routine 物理証拠累積監視で「直近 N 期間の AI agent reach 純粋数 / topic 別
# popular / status code 別 / 国別」 を 1 commande で取得する装置。

set -euo pipefail

PERIOD="${1:-24h}"
case "$PERIOD" in
  1h)  INTERVAL_VALUE="1";  INTERVAL_UNIT="HOUR" ;;
  24h) INTERVAL_VALUE="1";  INTERVAL_UNIT="DAY"  ;;
  7d)  INTERVAL_VALUE="7";  INTERVAL_UNIT="DAY"  ;;
  30d) INTERVAL_VALUE="30"; INTERVAL_UNIT="DAY"  ;;
  *)
    echo "Error: invalid period '$PERIOD'. Use 1h / 24h / 7d / 30d" >&2
    exit 1
    ;;
esac

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE" >&2
  exit 1
fi

CF_TOKEN=$(grep "^CF_TOKEN=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
ACCOUNT_ID="7fb3de0504d87405d9448db58005493f"

if [ -z "$CF_TOKEN" ]; then
  echo "Error: CF_TOKEN not set in .env" >&2
  exit 1
fi

API_URL="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql"

run_sql() {
  curl -sS "$API_URL" \
    -H "Authorization: Bearer ${CF_TOKEN}" \
    -d "$1"
}

echo ""
echo "================================================================"
echo "  tsuji Analytics Engine metrics(period: $PERIOD)"
echo "================================================================"

# 1. Path 別 集計(全 endpoint、 ai-agent / human-or-other 別)
echo ""
echo "── 1. Path 別 reach(ai-agent vs human/other)"
echo ""
run_sql "SELECT blob2 AS path, count() AS reqs, countIf(blob7 = 'ai-agent') AS ai_agent, countIf(blob7 = 'human-or-other') AS human FROM tsuji_analytics WHERE timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT GROUP BY path ORDER BY reqs DESC FORMAT JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  {\"path\":50} {\"total\":>6} {\"ai-agent\":>10} {\"human\":>8}')
print('  ' + '-' * 80)
for r in d.get('data', []):
    print(f'  {r[\"path\"][:50]:50} {r[\"reqs\"]:>6} {r[\"ai_agent\"]:>10} {r[\"human\"]:>8}')
if not d.get('data'):
    print('  (no requests in this period)')
"

# 2. AI agent UA 別 reach
echo ""
echo "── 2. AI agent UA 別 reach(自然 reach 監視 core)"
echo ""
run_sql "SELECT blob1 AS ua, count() AS reqs FROM tsuji_analytics WHERE blob7 = 'ai-agent' AND timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT GROUP BY ua ORDER BY reqs DESC FORMAT JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  {\"User-Agent\":70} {\"reqs\":>6}')
print('  ' + '-' * 80)
for r in d.get('data', []):
    print(f'  {r[\"ua\"][:70]:70} {r[\"reqs\"]:>6}')
if not d.get('data'):
    print('  (no AI agent reach in this period)')
"

# 3. Topic 別(industry-fact endpoint 限定)
echo ""
echo "── 3. industry-fact Topic 別(supply 第 1 弾 demand 観察)"
echo ""
run_sql "SELECT blob5 AS topic, count() AS reqs, countIf(blob7 = 'ai-agent') AS ai_agent FROM tsuji_analytics WHERE blob2 = '/x402/premium/industry-fact' AND timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT AND blob5 != '' GROUP BY topic ORDER BY reqs DESC FORMAT JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  {\"topic\":30} {\"reqs\":>6} {\"ai-agent\":>10}')
print('  ' + '-' * 80)
for r in d.get('data', []):
    print(f'  {r[\"topic\"]:30} {r[\"reqs\"]:>6} {r[\"ai_agent\"]:>10}')
if not d.get('data'):
    print('  (no industry-fact reach with topic in this period)')
"

# 4. Status code 別
echo ""
echo "── 4. Status code 別(payment flow 観察)"
echo ""
run_sql "SELECT blob4 AS status, count() AS reqs FROM tsuji_analytics WHERE timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT GROUP BY status ORDER BY reqs DESC FORMAT JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  {\"status\":10} {\"reqs\":>6}')
print('  ' + '-' * 80)
for r in d.get('data', []):
    print(f'  {r[\"status\"]:10} {r[\"reqs\"]:>6}')
"

# 5. Country 別
echo ""
echo "── 5. Country 別 reach(地域 distribution)"
echo ""
run_sql "SELECT blob6 AS country, count() AS reqs, countIf(blob7 = 'ai-agent') AS ai_agent FROM tsuji_analytics WHERE timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT GROUP BY country ORDER BY reqs DESC FORMAT JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  {\"country\":15} {\"reqs\":>6} {\"ai-agent\":>10}')
print('  ' + '-' * 80)
for r in d.get('data', []):
    print(f'  {r[\"country\"]:15} {r[\"reqs\"]:>6} {r[\"ai_agent\"]:>10}')
"

# 6. Total summary
echo ""
echo "── 6. Summary"
echo ""
run_sql "SELECT count() AS total, countIf(blob7 = 'ai-agent') AS ai_agent, countIf(blob7 = 'human-or-other') AS human FROM tsuji_analytics WHERE timestamp >= NOW() - INTERVAL '$INTERVAL_VALUE' $INTERVAL_UNIT FORMAT JSON" | python3 -c "
import sys, json
raw = sys.stdin.read()
try:
    d = json.loads(raw) if raw.strip() else {}
    rows = d.get('data', [])
    r = rows[0] if rows else {}
    print(f'  total requests   : {r.get(\"total\", 0)}')
    print(f'  AI agent reqs    : {r.get(\"ai_agent\", 0)}')
    print(f'  human/other reqs : {r.get(\"human\", 0)}')
except json.JSONDecodeError:
    print(f'  (no data, raw response: {raw[:200]})')
"

echo ""
echo "================================================================"
echo "  ✅ metrics 集計完了(period: $PERIOD)"
echo "================================================================"
echo ""
