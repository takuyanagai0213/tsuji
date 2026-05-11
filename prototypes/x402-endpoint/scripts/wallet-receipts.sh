#!/usr/bin/env bash
#
# tsuji wallet on-chain USDC 着金観察 script(段 3 = Phase 2 trigger 第 2 段 verify)
#
# Usage:
#   npm run wallet
#
# 永井さま Coinbase Smart Wallet on Base mainnet の ERC-20 token transfer 履歴を
# Blockscout API 経由で取得、 incoming 累計 + transfer 一覧を 1 命令で出す装置。
#
# 5/16 routine 物理証拠累積監視 段 3(on-chain payment 完了)観察 anchor。
# metrics.sh の段 1-2 と組み合わせて 3 段全部 1 命令で観察可能 form。

set -euo pipefail

WALLET="0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151"

echo ""
echo "================================================================"
echo "  tsuji wallet on-chain receipts(段 3 = USDC mainnet 着金 verify)"
echo "================================================================"
echo ""
echo "wallet: $WALLET (Base mainnet)"
echo ""

curl -sS "https://base.blockscout.com/api/v2/addresses/${WALLET}/token-transfers?type=ERC-20" | WALLET="$WALLET" python3 -c "
import sys, json, os
d = json.load(sys.stdin)
items = d.get('items', [])
target = os.environ['WALLET'].lower()
print(f'ERC-20 transfer 件数: {len(items)}')
print()
if items:
    print(f'  {\"timestamp\":25} {\"direction\":>8} {\"amount\":>14} {\"token\":>8} {\"counterparty\":18}')
    print('  ' + '-' * 80)
    incoming_total = {}
    for t in items[:50]:
        ts = t.get('timestamp', 'N/A')
        token = t.get('token', {}) or {}
        symbol = token.get('symbol', '?')
        decimals = int(token.get('decimals', '18') or '18')
        total = t.get('total', {}) or {}
        value = int(total.get('value', '0') or '0') / (10 ** decimals)
        from_hash = ((t.get('from', {}) or {}).get('hash') or '').lower()
        to_hash = ((t.get('to', {}) or {}).get('hash') or '').lower()
        is_in = to_hash == target
        if is_in:
            incoming_total[symbol] = incoming_total.get(symbol, 0.0) + value
        direction = 'IN <-' if is_in else 'OUT ->'
        other = (from_hash if is_in else to_hash)[:16] + '..'
        print(f'  {ts[:25]:25} {direction:>8} {value:>14.6f} {symbol:>8} {other:18}')
    print('  ' + '-' * 80)
    if incoming_total:
        for sym, total in incoming_total.items():
            print(f'  ✅ 段 3 達成: {sym} 累計 incoming = {total:.6f}')
    else:
        print('  段 3 未達: incoming token transfer 0 件(outgoing のみ)')
else:
    print('  段 3 未達: wallet 着金履歴 0 件(Phase 2 trigger 第 2 段未達 物理 confirm)')
"

echo ""
echo "================================================================"
echo "  ✅ wallet receipts 確認完了"
echo "================================================================"
echo ""
