# tsuji architecture

## Layers

```
[AI agent / human client]
        ↓ HTTP request
[Cloudflare Workers x402 middleware]  ← Phase 1 deploy
        ↓ HTTP 402 + JSON payload
[client signs USDC transaction]
        ↓ payment proof header attach
[facilitator (Coinbase) verify on-chain]  ← Base chain
        ↓ verify OK
[server delivers resource]
        ↓
[USDC → 永井さま wallet]  ← Coinbase Wallet (Base network)
```

## Components(Phase 1+)

- **endpoint server**: Cloudflare Workers, TypeScript, x402 middleware(50 行程度)
- **Skill API**: 100 Skills の一部 public endpoint(Phase 1 で 1-2 件選定)
- **Memory query API**: 33,999 memory bank anonymized excerpts(Phase 2)
- **Consulting invoice**: x402 invoice form(Phase 2)
- **Brand fact endpoint**: AEO citation 時 fetch(Phase 2)

## Data flow(一人コンパウンド rule 整合)

```
[各子プロジェクト endpoint] ← (Phase 3) → [tsuji 統合 micropayment infrastructure]
  - omamori: LINE context anonymized excerpts
  - harness_eng: brand fact / 物理証拠 / Skill catalog
  - tokimeli: 業務効率化 N=1 case study
  - aizuchi: 父世代 AI 話相手 PoC fact
  - lodge: 物理体験 design fact
  - D 案 brand: 美学物理化 fact (要 anonymization 厳格)
```

詳細: [[thought_x402_protocol_for_solo_compound_2026_05_09]]
