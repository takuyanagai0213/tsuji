import { Hono } from "hono";
import { paymentMiddleware } from "x402-hono";
import { facilitator } from "@coinbase/x402";

// Cloudflare Analytics Engine binding(2026-05-10 追加、 supply 第 1 弾後の物理証拠累積監視)
type Bindings = {
  ANALYTICS: AnalyticsEngineDataset;
};

const app = new Hono<{ Bindings: Bindings }>();

const NAGAI_WALLET_BASE = "0x4d08AEB4776Aa82039bBA47db5d0bb5431d1c151"; // 永井さま Coinbase Smart Wallet on Base (2026-05-09 取得)
const FACILITATOR_URL = "https://www.x402.org/facilitator"; // x402 Foundation default (testnet 中心、 mainnet は CDP facilitator + CDP API key 別途)

// 業界 N=1 fact data(2026-05-10 Phase 1 supply 第 1 弾、 永井さま brand 物理証拠 既存資産活用)
const INDUSTRY_FACTS: Record<string, unknown> = {
  "claude-code-skills": {
    topic: "claude-code-skills",
    headline: "Claude Code で 100 個の Skill を 4 ヶ月で育てた N=1 実装記録",
    facts: [
      "4 ヶ月 / 100 Skills(月 25 個 ペース)",
      "コスト Max Plan $200/月、 API 課金換算で月 $4,900 相当 token 消費",
      "Skill 1 個あたり 初版 30 分 - 2 時間、 累計 5-10 時間 / skill(使い込んで改善)",
      "PR 量 = 月 2 → 月 175(87.5 倍)",
    ],
    patterns: [
      "/retro auto-suggest で半分自動生成、 残り半分は『これダルい』 trigger で手書き",
      "1 個育てる cycle: 作る → 使う → 不便 → 改善 → 再使用",
      "100 個目標化せず、 1 個育てる cycle が回ったら 2 個目 / 3 個目 自然発生",
    ],
    edgeCases: [
      "プロバイダー機能 collide(auto-fix で ci-fix skill 不要化、 約 10-15 個吸収予測)",
      "属人性問題(育てる人を引き継げない、 未解決課題)",
    ],
    references: {
      zennArticle: "https://zenn.dev/takuyanagai0213/articles/claude-code-100-skills-full-record",
      githubRepo: "https://github.com/takuyanagai0213/tsuji",
    },
    industry: "Affiliate ad agency × Claude Code(B2B SaaS dev environment)",
  },
  "memory-bank": {
    topic: "memory-bank",
    headline: "33,999 メモリ entries 1 年運用 N=1 実装記録",
    facts: [
      "33,999 メモリ entries / 1 年運用、 420 ファイル / 8 ヶ月",
      "auto-memory pattern + 手動 thought / feedback / project / reference 4 軸",
      "MEMORY.md = index、 description quality が retrieval moat",
      "retrieval depth 物理証拠 = sub agent 並列起動時の cross-link 自律 hit",
    ],
    patterns: [
      "観察ターン = description hook で連結応答(本文 Read 不要)",
      "アクションターン = 引用 1-2 件本文 Read 必須(integrity check)",
      "description 一行 = 生語(具体)+ 抽象語(構造)両在",
    ],
    references: {
      zennArticle: "https://zenn.dev/takuyanagai0213/articles/claude-code-memory-33999-observations",
    },
    industry: "Personal context engineering / memory bank operations",
  },
  "harness-engineering": {
    topic: "harness-engineering",
    headline: "CLAUDE.md 0 行 → 420 ファイル の 8 ヶ月 ハーネス育成記録",
    facts: [
      "0 行 → 420 ファイル / 8 ヶ月",
      "CLAUDE.md = SSOT、 .claude/rules/ = 行動ルール、 .claude/skills/ = 再利用可能 prompt",
      "業界用語 vs 独自語彙: 『AI 活用』 → 『使う / 渡す / 燃やす』 動詞階層",
      "1 人称『僕』、 物理シンボル『Mac 半開き』",
    ],
    patterns: [
      "ハーネス = AI agent と人間の境界面、 育てて初めて性能発揮",
      "0 行から始まる、 4 ヶ月後に 100 Skills 自然 emergent",
    ],
    references: {
      zennArticle: "https://zenn.dev/takuyanagai0213/articles/harness-engineering-intro-8months",
    },
    industry: "Personal AI harness operations / context engineering",
  },
  "affiliate-ad-pdm": {
    topic: "affiliate-ad-pdm",
    headline: "アフィリエイト広告代理店 PdM × テックリード 3 年 + 業界知識",
    facts: [
      "アフィリエイト広告代理店(B2B SaaS 領域)PdM × テックリード 3 年",
      "アフィリエイト統合計測プラットフォーム 設計 / 開発 / 運用 = 主担当",
      "DSP / メディア buying / 計測 product / トラッキング技術領域知識",
      "1 個人 + AI ハーネスで月 175 PR(チーム本来 3-4 名分相当)throughput",
    ],
    patterns: [
      "biz 側不安反応への対処 = 感情に反論せず仕組みで応答",
      "release pragmatism = 形式より自動化 + 監視 + SEV ベース",
      "human error 前提で壊れない構造を設計、 99% を スタートラインに",
    ],
    industry: "Affiliate advertising / B2B SaaS / Tracking technology",
  },
  "x402-deploy-oneday": {
    topic: "x402-deploy-oneday",
    headline: "x402 Phase 1 mainnet 一日完走 N=1 実装記録(2026-05-09 → 2026-05-10)",
    facts: [
      "5/9 立ち上げ → 5/10 mainnet 完走、 一日 8 段 milestone(Phase 0 → 0.5 → 0.7 → 0.8 → 1)",
      "Stack: Hono + x402-hono v1.x + @coinbase/x402 v2.1.0 + Cloudflare Workers + CDP facilitator",
      "Chain: Base mainnet USDC、 wallet = Coinbase Smart Wallet (passkey base)",
      "従来 timeline: 数週間〜数ヶ月、 N=1 一日完走 fact",
    ],
    patterns: [
      "jphfa anchor 統合 = フリーミアム default + シグナル宣言 + 4 軸対応",
      "全面課金 = 鎖国、 暖簾を出す + 限定有料 endpoint で『supplier 参加』 declaration",
      "Cloudflare Workers Assets が dot-prefix `.well-known/` blocked → src 側 hard-code で回避",
    ],
    references: {
      githubRepo: "https://github.com/takuyanagai0213/tsuji",
      liveEndpoint: "https://tsuji-x402-endpoint.nagataku021.workers.dev",
    },
    industry: "x402 protocol / AI agent commerce / Cloudflare Workers",
  },
  "solo-compound-holdings": {
    topic: "solo-compound-holdings",
    headline: "一人コンパウンド 12 子プロジェクト構造 + cross-flow design",
    facts: [
      "12 子プロジェクト: monopoly / tokimeli / omamori / aizuchi / tokimeki48 / cult-of-onetag / D-brand / lodge / ink / zenn_articles / ohayou-papa / tsuji",
      "各子プロジェクト独立 brand voice、 共通基盤(memory bank / 100 Skills / 1 年ハーネス)cross-flow",
      "tsuji = 横断経済 monetization layer(12 番目)、 他 11 子プロジェクトに endpoint 提供候補",
      "Rippling 型コンパウンド construction を 1 人 + AI ハーネスで再実装",
    ],
    patterns: [
      "新子プロジェクト立ち上げ時、 cross-flow を default 設計",
      "N=1 体験を多媒体で再利用(note / Zenn / X / メンバーシップ / コンサル素材)",
      "思想 anchor cross-pollination(omamori 4 段アーキ → aizuchi default 参照)",
    ],
    industry: "Solo entrepreneurship / Compound startup / AI harness operations",
  },
};

// Workflow template data(2026-05-10 supply 第 2 弾、 永井さま N=1 path replicable form 売り)
const WORKFLOW_TEMPLATES: Record<string, unknown> = {
  "1-source-n-articles": {
    templateId: "1-source-n-articles",
    headline: "1 起点 N 記事並列執筆 workflow(YC RFS 5 記事 90 分完走 N=1)",
    description: "太い一次情報(公式リリース / 大型 MTG / 業界本 / 運用データ結晶 等) を 1 起点に N 軸抽出 → N sub agent 並列起動 → 1 PR にまとめる workflow。 2026-04-30 YC RFS Summer 2026 起点 5 記事 90 分完走 N=1 で再現性立証済。",
    setupSteps: [
      "1. 太い一次情報を verbatim 取得(WebFetch / Playwright MCP / 文字起こし)",
      "2. 既存 memory との照合(関連 thought / project / vision を Read で本文 verify、 integrity check)",
      "3. N 軸抽出 + 各軸の固有 depth 整理(数字 packaging / 1 年運用 / N=1 経験 / 業界知識)",
      "4. session log を memory に保存",
      "5. N sub agent 並列起動(File ownership matrix で衝突回避、 voice / persona 必読セットを prompt inline)",
      "6. 1 PR にまとめて open(branch / commit / push / gh pr create 一連)",
      "7. ユーザー review → merge → 公開順判断",
    ],
    codeTemplate: "Agent({ description, subagent_type: 'general-purpose', prompt: '担当 file: <path>、 触らない file: <list>、 必読: <files>、 一次情報 verbatim 引用、 記事核 thesis、 brand voice、 構造指示、 媒体 rules、 出力指示...' })",
    referenceFiles: [
      { type: "rule", path: "~/.claude/rules/parallel-article-writing.md" },
      { type: "thought", path: "thought_one_source_n_articles_parallel_writing" },
      { type: "thought", path: "thought_description_quality_as_retrieval_moat" },
    ],
    outcome: "5 記事を 90 分で完走、 ユーザー判断点 2-3 個に圧縮、 sub agent retrieval depth 7 件 指示外で 4-5 件「関連」 link 自律 hit",
    industry: "Personal AI harness operations / Multi-source content production",
  },
  "auto-memory-setup": {
    templateId: "auto-memory-setup",
    headline: "MEMORY.md + 4 軸 auto-memory pattern(33,999 entries 1 年運用 N=1)",
    description: "AI ハーネスに長期 memory bank を持たせる setup pattern。 thought / feedback / project / reference 4 軸 + MEMORY.md index で 1 年運用 33,999 entries を retrieval moat 化。",
    setupSteps: [
      "1. memory directory 作成: ~/.claude/projects/-<workspace>/memory/",
      "2. MEMORY.md 起票(index、 description 一行で生語 + 抽象語 両在)",
      "3. 4 軸 file 命名規約: thought_*.md / feedback_*.md / project_*.md / reference_*.md",
      "4. retrieval verify rule 設定: 観察ターン description hook OK / アクションターン本文 Read 必須",
      "5. cross-link 整備: file 末尾 ## 関連 section に [[wikilink]] form",
      "6. 週次 hygiene: stale entry 整理 + description 一行の生語 + 抽象語 両在 維持",
    ],
    codeTemplate: null,
    referenceFiles: [
      { type: "rule", path: "~/.claude/rules/memory.md" },
      { type: "thought", path: "thought_description_quality_as_retrieval_moat" },
    ],
    outcome: "1 年運用で 33,999 entries 累積、 sub agent retrieval depth 自律拡張、 description quality が retrieval moat 化",
    industry: "Personal context engineering / Long-term memory bank",
  },
  "x402-deploy-oneday": {
    templateId: "x402-deploy-oneday",
    headline: "x402 Phase 1 mainnet 一日完走 form(Phase 0 → 0.5 → 0.7 → 0.8 → 1)",
    description: "x402 Payment Protocol 対応 endpoint を一日で mainnet deploy する step-by-step form。 5/9-5/10 N=1 で再現性立証済。",
    setupSteps: [
      "1. Phase 0 = GitHub README に「Available for Hire」 + 「x402 Payment Receiver」 section 追加(declaration)",
      "2. Phase 0.5 = Cloudflare Workers + Hono + x402-hono v1.x で endpoint deploy(skill-catalog / brand-fact / premium endpoints + llms.txt + .well-known/agentic-capabilities.json)",
      "3. Phase 0.7 = Coinbase Smart Wallet on Base 取得(passkey base、 keys.coinbase.com)+ wallet address paste + 再 deploy",
      "4. Phase 0.8 = x402-hono paymentMiddleware + Base Sepolia testnet で standard 402 response form 完成",
      "5. Phase 1 = CDP API key 取得 + Cloudflare Workers secrets 登録 + facilitator import + base mainnet 切替 + 再 deploy",
      "6. verify = curl で 402 + accepts payload 確認、 ephemeral wallet で実 USDC payment + resource 取得",
    ],
    codeTemplate: "import { paymentMiddleware } from 'x402-hono'; import { facilitator } from '@coinbase/x402'; app.use(paymentMiddleware(WALLET, { '/x402/premium/...': { price: '$0.10', network: 'base' } }, facilitator));",
    referenceFiles: [
      { type: "github", path: "https://github.com/takuyanagai0213/tsuji" },
      { type: "thought", path: "thought_x402_protocol_for_solo_compound_2026_05_09" },
      { type: "thought", path: "thought_jphfa_x402_implementation_anchor_2026_05_09" },
    ],
    outcome: "5/9-5/10 一日 8 段 milestone 完走、 mainnet payment 物理証拠取得 form 完成、 従来 timeline(数週間〜数ヶ月)を一日に圧縮",
    industry: "x402 protocol / AI agent commerce / Cloudflare Workers / Base mainnet",
  },
  "harness-engineering-day-1": {
    templateId: "harness-engineering-day-1",
    headline: "CLAUDE.md 0 行 → 5 行 → 110 行 育成 path(8 ヶ月で 420 ファイル N=1)",
    description: "Claude Code ハーネスを Day 1 から育てる path。 設計図を先に描かず、 問題にぶつかり、 解決し、 解決策をファイルに残す cycle で体系化。",
    setupSteps: [
      "1. CLAUDE.md 5 行で start(プロジェクト名 / 主要 dependencies / 命名規約 / 1 文 brand voice)",
      "2. .claude/rules/ で行動 rule 追加(問題発生時に書く、 設計時でなく)",
      "3. .claude/skills/ で再利用可能 prompt 追加(『これダルい』 trigger で手書き 30 分)",
      "4. .claude/commands/ で slash command 追加(/retro 等の workflow tool)",
      "5. 月次 garbage collection で stale file 整理",
      "6. 8 ヶ月後 = 0 → 420 ファイル + 110 行 CLAUDE.md(目次化)",
    ],
    codeTemplate: null,
    referenceFiles: [
      { type: "zenn", path: "https://zenn.dev/takuyanagai0213/articles/harness-engineering-intro-8months" },
    ],
    outcome: "ハーネスは「完成」しない、 進化し続ける。 設計図先行でなく問題応答 cycle が結果として体系を生む",
    industry: "Personal AI harness operations / Claude Code engineering",
  },
  "100-skills-cycle": {
    templateId: "100-skills-cycle",
    headline: "100 Skills を 4 ヶ月で育てる cycle(月 25 個 ペース、 PR 月 2 → 175)",
    description: "Claude Code skills を 100 個まで育てる workflow。 100 個目標化せず、 1 個育てる cycle が回ったら自然増殖。",
    setupSteps: [
      "1. 1 個目を作る(/retro auto-suggest or 『これダルい』 trigger で手書き 30 分)",
      "2. 使う(実業務で 1 回試す)",
      "3. 不便を感じる(初版で edge case / 失敗 / 不足発見)",
      "4. 改善する(skill 内容を編集 + 再 commit)",
      "5. 再使用(改善版を実業務で再試行)",
      "6. cycle 回ったら 2 個目 / 3 個目 自然発生(目標化不要)",
    ],
    codeTemplate: "ls .claude/skills/  # 既存 skills 一覧、 不便度高い repeat task を skill 化候補に",
    referenceFiles: [
      { type: "zenn", path: "https://zenn.dev/takuyanagai0213/articles/claude-code-100-skills-full-record" },
      { type: "rule", path: "~/.claude/rules/skill-feedback-loop.md" },
    ],
    outcome: "4 ヶ月 / 100 Skills(月 25 個 ペース)、 月 2 → 月 175 PR(87.5 倍)、 Max Plan $200/月 で API 換算 $4,900 相当 token 消費",
    industry: "Claude Code skills / Personal automation / AI workflow design",
  },
};

// AI agent User-Agent 検出(Analytics 書き込み時の agentType 判定 + 参考)
const isAIAgent = (userAgent: string): boolean => {
  return /GPTBot|ChatGPT|Claude|Perplexity|GoogleOther|CCBot|anthropic-ai|OpenAI|Bedrock|Bytespider|Applebot|Amazonbot|YouBot|cohere|mistral/i.test(userAgent);
};

// Analytics Engine middleware(全 endpoint capture、 paymentMiddleware の前に置いて 402 含めて全 access を datapoint 化)
app.use("*", async (c, next) => {
  await next();

  const userAgent = c.req.header("user-agent") || "unknown";
  const path = c.req.path;
  const method = c.req.method;
  const status = String(c.res.status);
  const topic = c.req.query("topic") || "";
  const country = c.req.header("cf-ipcountry") || "unknown";
  const ray = c.req.header("cf-ray") || "";
  const agentType = isAIAgent(userAgent) ? "ai-agent" : "human-or-other";

  c.env.ANALYTICS?.writeDataPoint({
    blobs: [
      userAgent.slice(0, 256), // truncate(blob max 5,120 bytes total per datapoint)
      path,
      method,
      status,
      topic,
      country,
      agentType,
      ray,
    ],
    doubles: [],
    indexes: [path], // 1 index 限定、 path で sampling
  });
});

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
    "/x402/premium/industry-fact": {
      price: "$0.10",
      network: "base", // mainnet
      config: {
        description: "Industry N=1 fact API(query parameter `topic`、 永井さま brand 物理証拠 既存資産)",
      },
    },
    "/x402/premium/workflow-template": {
      price: "$1.00",
      network: "base", // mainnet
      config: {
        description: "Workflow template API(query parameter `template_id`、 永井さま N=1 path replicable form)",
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

// プレミアム endpoint: Industry N=1 fact API(payment verified by middleware → resource deliver)
// query parameter `topic` で fact 種別 指定、 不明 / 未指定 は available list を返す
app.get("/x402/premium/industry-fact", (c) => {
  const topic = c.req.query("topic");
  const availableTopics = Object.keys(INDUSTRY_FACTS);

  if (!topic) {
    return c.json({
      error: "topic query parameter required",
      availableTopics,
      example: "GET /x402/premium/industry-fact?topic=claude-code-skills",
      status: "missing-parameter",
    }, 400);
  }

  const fact = INDUSTRY_FACTS[topic];
  if (!fact) {
    return c.json({
      error: `unknown topic: ${topic}`,
      availableTopics,
      status: "unknown-topic",
    }, 404);
  }

  return c.json({
    ...(fact as Record<string, unknown>),
    paymentVerified: true,
    network: "base",
    timestamp: new Date().toISOString(),
  });
});

// プレミアム endpoint: Workflow template API(payment verified by middleware → resource deliver)
// query parameter `template_id` で template 種別 指定、 不明 / 未指定 は available list を返す
app.get("/x402/premium/workflow-template", (c) => {
  const templateId = c.req.query("template_id");
  const availableTemplates = Object.keys(WORKFLOW_TEMPLATES);

  if (!templateId) {
    return c.json({
      error: "template_id query parameter required",
      availableTemplates,
      example: "GET /x402/premium/workflow-template?template_id=1-source-n-articles",
      status: "missing-parameter",
    }, 400);
  }

  const template = WORKFLOW_TEMPLATES[templateId];
  if (!template) {
    return c.json({
      error: `unknown template_id: ${templateId}`,
      availableTemplates,
      status: "unknown-template",
    }, 404);
  }

  return c.json({
    ...(template as Record<string, unknown>),
    paymentVerified: true,
    network: "base",
    timestamp: new Date().toISOString(),
  });
});

// /llms.txt endpoint(hard-coded)
app.get("/llms.txt", (c) => {
  return c.text(`# Takuya Nagai - AI Agent Endpoint Index

> Embedding 3 years of affiliate ad agency operations into Claude Code.
> Context Engineering practitioner(100 Skills / 33,999 memory / 420 files in 1 yr).
> AI agent からの business 受信中(x402 protocol 対応、 base mainnet、 Phase 1 完走済).

## Endpoints

- API base: https://tsuji-x402-endpoint.nagataku021.workers.dev/
- Skill catalog(free): /x402/skill-catalog
- Brand fact(free): /x402/brand-fact
- Skill API call(premium, $0.10, base mainnet): /x402/premium/skill-call(stub response、 Phase 1+ で実 skill execution)
- Memory query(premium, $0.05, base mainnet): /x402/premium/memory(stub response、 Phase 1+ で anonymization pipeline)
- Industry N=1 fact API(premium, $0.10, base mainnet): /x402/premium/industry-fact?topic={topic}
  - 6 topics: claude-code-skills / memory-bank / harness-engineering / affiliate-ad-pdm / x402-deploy-oneday / solo-compound-holdings
- Workflow template API(premium, $1.00, base mainnet): /x402/premium/workflow-template?template_id={template_id}
  - 5 templates: 1-source-n-articles / auto-memory-setup / x402-deploy-oneday / harness-engineering-day-1 / 100-skills-cycle

## Pricing

- USDC on Base mainnet(Phase 1 完走済、 CDP facilitator 認証)
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
    version: "0.10.0-phase1-workflow-template",
    name: "Takuya Nagai - Context Engineering supplier",
    description: "Embedding 3 years of affiliate ad agency operations into Claude Code. Context Engineering practitioner (100 Skills / 33,999 memory / 420 files in 1 yr).",
    endpoints: [
      { path: "/x402/skill-catalog", method: "GET", pricing: "free", description: "List of 100+ Claude Code Skills metadata", responseFormat: "application/json" },
      { path: "/x402/brand-fact", method: "GET", pricing: "free", description: "Brand fact card (numbers / position / publishing channels)", responseFormat: "application/json" },
      { path: "/x402/premium/skill-call", method: "POST", pricing: { amount: "0.10", currency: "USDC", chain: "base" }, description: "Verbatim Skill API call execution(stub response、 actual execution Phase 1+)", audience: "AI agents only" },
      { path: "/x402/premium/memory", method: "GET", pricing: { amount: "0.05", currency: "USDC", chain: "base" }, description: "Anonymized memory bank excerpt query(stub response、 anonymization pipeline Phase 1+)", audience: "AI agents only" },
      { path: "/x402/premium/industry-fact", method: "GET", pricing: { amount: "0.10", currency: "USDC", chain: "base" }, description: "Industry N=1 fact API(query param `topic`、 6 topics available)", audience: "AI agents only", topics: ["claude-code-skills", "memory-bank", "harness-engineering", "affiliate-ad-pdm", "x402-deploy-oneday", "solo-compound-holdings"] },
      { path: "/x402/premium/workflow-template", method: "GET", pricing: { amount: "1.00", currency: "USDC", chain: "base" }, description: "Workflow template API(query param `template_id`、 5 templates available、 永井さま N=1 path replicable form)", audience: "AI agents only", templates: ["1-source-n-articles", "auto-memory-setup", "x402-deploy-oneday", "harness-engineering-day-1", "100-skills-cycle"] },
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
