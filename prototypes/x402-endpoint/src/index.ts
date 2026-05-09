import { Hono } from "hono";
import { paymentMiddleware } from "x402-hono";
import { facilitator } from "@coinbase/x402";

const app = new Hono();

const NAGAI_WALLET_BASE = "0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151"; // 永井さま Coinbase Smart Wallet on Base (2026-05-09 取得)
const FACILITATOR_URL = "https://www.x402.org/facilitator"; // x402 Foundation default (testnet 中心、 mainnet は CDP facilitator + CDP API key 別途)

// AI agent User-Agent 検出(参考、 middleware 適用後は判定不要)
const isAIAgent = (userAgent: string): boolean => {
  return /GPTBot|ChatGPT|Claude|Perplexity|GoogleOther|CCBot|anthropic-ai|OpenAI|Bedrock/i.test(userAgent);
};

// x402 シグナル宣言 middleware(全 endpoint で対応宣言、 jphfa anchor「暖簾を出しておく」 戦略)
app.use("*", async (c, next) => {
  c.header("X-Payment-Required", "x402");
  c.header("X-Payment-Currency", "USDC");
  c.header("X-Payment-Chain", "base");
  c.header("X-Payment-Wallet", NAGAI_WALLET_BASE);
  c.header("X-Payment-Facilitator", FACILITATOR_URL);
  await next();
});

// x402 payment middleware(premium endpoint 限定、 Phase 1 mainnet base + CDP facilitator 認証)
app.use(paymentMiddleware(
  NAGAI_WALLET_BASE as `0x${string}`,
  {
    "/x402/premium/skill-call": {
      price: "$0.10",
      network: "base", // mainnet
      config: {
        description: "Verbatim Skill API call execution",
      },
    },
    "/x402/premium/memory": {
      price: "$0.05",
      network: "base", // mainnet
      config: {
        description: "Anonymized memory bank excerpt query",
      },
    },
  },
  facilitator, // CDP facilitator (env vars CDP_API_KEY_ID + CDP_API_KEY_SECRET)
));

// Root endpoint: project overview
app.get("/", (c) => {
  return c.text(`Takuya Nagai - tsuji (辻) x402 endpoint
Phase 0.8 prototype, deployed via Cloudflare Workers + Hono + x402-hono middleware.

For details, see:
- /llms.txt
- /.well-known/agentic-capabilities.json
- https://github.com/takuyanagai0213
`);
});

// 無料 endpoint: Skill catalog(metadata only)
app.get("/x402/skill-catalog", (c) => {
  return c.json({
    skills: [
      { id: "ohayo", name: "Ohayo briefing", description: "Daily morning briefing(Calendar + Linear + Slack + Gmail)" },
      { id: "x-poster", name: "X poster + analytics", description: "X post management with analytics" },
      { id: "omamori", name: "omamori", description: "Personal LINE history-based relationship support AI" },
      { id: "ohayou-papa", name: "ohayou-papa", description: "Father video message generator(voice clone + GPT Image 2 + SadTalker)" },
    ],
    total: 100,
    pricing: "metadata: free, verbatim call: $0.10/call (premium endpoint, testnet base-sepolia)",
    docs: "https://github.com/takuyanagai0213/takuyanagai0213#x402-payment-receiver",
  });
});

// 無料 endpoint: brand fact
app.get("/x402/brand-fact", (c) => {
  return c.json({
    name: "Takuya Nagai",
    position: "Affiliate ad agency PdM × Tech Lead (3 years)",
    contextEngineering: {
      skills: 100,
      memoryEntries: 33999,
      contextFiles: 420,
      monthlyPRs: 175,
      yearsRunning: 1,
    },
    physicalSymbol: "Mac always half-open",
    publishingChannels: {
      github: "https://github.com/takuyanagai0213",
      zenn: "https://zenn.dev/takuyanagai0213",
      note: "https://note.com/harness_eng",
    },
    holdings: {
      structure: "Solo compound holdings (12 sub-projects: monopoly / tokimeli / omamori / aizuchi / tokimeki48 / cult-of-onetag / D-brand / lodge / ink / zenn_articles / ohayou-papa / tsuji)",
    },
  });
});

// プレミアム endpoint: Skill API verbatim call(payment verified by middleware → resource deliver)
app.post("/x402/premium/skill-call", (c) => {
  return c.json({
    result: "[skill API call result placeholder - Phase 0.8 implementation, actual skill execution in Phase 1+]",
    status: "delivered",
    paymentVerified: true,
    network: "base-sepolia",
  });
});

// プレミアム endpoint: Memory query(payment verified by middleware → resource deliver)
app.get("/x402/premium/memory", (c) => {
  return c.json({
    result: "[anonymized memory excerpt placeholder - Phase 0.8 implementation]",
    status: "delivered",
    paymentVerified: true,
    network: "base-sepolia",
  });
});

// /llms.txt endpoint(hard-coded)
app.get("/llms.txt", (c) => {
  return c.text(`# Takuya Nagai - AI Agent Endpoint Index

> Embedding 3 years of affiliate ad agency operations into Claude Code.
> Context Engineering practitioner(100 Skills / 33,999 memory / 420 files in 1 yr).
> AI agent からの business 受信準備中(x402 protocol 対応、 testnet base-sepolia).

## Endpoints

- API base: https://tsuji-x402-endpoint.nagataku021.workers.dev/
- Skill catalog(free): /x402/skill-catalog
- Brand fact(free): /x402/brand-fact
- Skill API call(premium, $0.10, base-sepolia): /x402/premium/skill-call
- Memory query(premium, $0.05, base-sepolia): /x402/premium/memory

## Pricing

- USDC on Base Sepolia testnet(Phase 0.8 先行、 mainnet 移行は CDP facilitator + CDP API key 取得後)
- Mainnet base USDC accepted(Phase 1+)
- Solana USDC accepted(Phase 2 候補)

## Discovery Channel Status

- GitHub README: https://github.com/takuyanagai0213
- llms.txt: this file
- .well-known/agentic-capabilities.json: machine-readable capability declaration

## Profile

- GitHub: https://github.com/takuyanagai0213
- Zenn: https://zenn.dev/takuyanagai0213
- note: https://note.com/harness_eng
- X: https://x.com/ejq45liu

## Holdings structure

Solo compound holdings(12 sub-projects):
monopoly / tokimeli / omamori / aizuchi / tokimeki48 / cult-of-onetag / D-brand / lodge / ink / zenn_articles / ohayou-papa / tsuji(this endpoint)
`);
});

// .well-known/agentic-capabilities.json endpoint(hard-coded)
app.get("/.well-known/agentic-capabilities.json", (c) => {
  return c.json({
    version: "0.8.0-phase08",
    name: "Takuya Nagai - Context Engineering supplier",
    description: "Embedding 3 years of affiliate ad agency operations into Claude Code. Context Engineering practitioner (100 Skills / 33,999 memory / 420 files in 1 yr).",
    endpoints: [
      { path: "/x402/skill-catalog", method: "GET", pricing: "free", description: "List of 100+ Claude Code Skills metadata", responseFormat: "application/json" },
      { path: "/x402/brand-fact", method: "GET", pricing: "free", description: "Brand fact card (numbers / position / publishing channels)", responseFormat: "application/json" },
      { path: "/x402/premium/skill-call", method: "POST", pricing: { amount: "0.10", currency: "USDC", chain: "base-sepolia" }, description: "Verbatim Skill API call execution", audience: "AI agents only" },
      { path: "/x402/premium/memory", method: "GET", pricing: { amount: "0.05", currency: "USDC", chain: "base-sepolia" }, description: "Anonymized memory bank excerpt query", audience: "AI agents only" },
    ],
    wallet: {
      base: NAGAI_WALLET_BASE,
      baseSepolia: NAGAI_WALLET_BASE,
      solana: "(Phase 2 候補)",
    },
    humanVerification: {
      worldId: "(Phase 2 候補)",
      githubProfile: "https://github.com/takuyanagai0213",
    },
    contactPath: {
      humanClient: "https://x.com/ejq45liu",
      issue: "https://github.com/takuyanagai0213/takuyanagai0213/issues/new",
    },
    x402: {
      protocol: "https://www.x402.org/",
      facilitator: FACILITATOR_URL,
      middleware: "x402-hono v1.x (Phase 0.8、 v2 @x402/hono 移行は別 turn)",
    },
    holdings: {
      structure: "Solo compound holdings",
      subProjects: [
        "monopoly", "tokimeli", "omamori", "aizuchi",
        "tokimeki48", "cult-of-onetag", "D-brand", "lodge",
        "ink", "zenn_articles", "ohayou-papa", "tsuji",
      ],
      total: 12,
    },
  });
});

export default app;
