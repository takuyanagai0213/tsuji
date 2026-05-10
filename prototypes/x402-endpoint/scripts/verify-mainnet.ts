/**
 * α path mainnet verify script
 *
 * Phase 1 mainnet endpoint(/x402/premium/industry-fact)を ephemeral EOA wallet 経由で
 * 実 USDC payment + resource 取得 verify する script。 mainnet transaction hash を
 * 物理証拠として永続記録(blockchain explorer 経由)。
 *
 * Flow:
 * 1. ephemeral private key を generate or load(.env.verify、 gitignored)
 * 2. ephemeral wallet の USDC balance を Base mainnet 上で確認
 * 3. balance 不足なら永井さま手動 USDC 送金指示 + exit
 * 4. balance OK なら x402-fetch 経由で payment + resource 取得
 * 5. transaction hash を console + basescan URL で表示
 */

import { wrapFetchWithPayment } from "x402-fetch";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient, http, formatUnits, erc20Abi, parseUnits } from "viem";
import { base } from "viem/chains";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_VERIFY_PATH = path.join(__dirname, "..", ".env.verify");
const ENDPOINT_URL =
  "https://tsuji-x402-endpoint.nagataku021.workers.dev/x402/premium/industry-fact?topic=claude-code-skills";
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const USDC_DECIMALS = 6;
const REQUIRED_USDC = parseUnits("0.10", USDC_DECIMALS); // endpoint price
const BUFFER_USDC = parseUnits("0.20", USDC_DECIMALS); // verify safety + maxValue

async function loadOrGenerateKey(): Promise<`0x${string}`> {
  if (fs.existsSync(ENV_VERIFY_PATH)) {
    const env = fs.readFileSync(ENV_VERIFY_PATH, "utf-8");
    const match = env.match(/EPHEMERAL_PRIVATE_KEY=(0x[a-fA-F0-9]{64})/);
    if (!match) throw new Error(".env.verify exists but malformed");
    console.log("📂 Loaded existing ephemeral key from .env.verify");
    return match[1] as `0x${string}`;
  }
  const pk = generatePrivateKey();
  fs.writeFileSync(ENV_VERIFY_PATH, `EPHEMERAL_PRIVATE_KEY=${pk}\n`, { mode: 0o600 });
  console.log("🔑 Generated new ephemeral key, saved to .env.verify (gitignored, 0600)");
  return pk;
}

async function checkBalance(address: `0x${string}`): Promise<bigint> {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });
  const balance = (await publicClient.readContract({
    address: USDC_BASE_MAINNET,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  })) as bigint;
  return balance;
}

function showFundingInstructions(address: `0x${string}`): void {
  console.log("\n⚠️  USDC 残高不足。 永井さま手動 step が必要:\n");
  console.log("  1. 既存 wallet (Coinbase Smart Wallet 等) から ephemeral address に");
  console.log("     Base mainnet で USDC $0.20 送金:\n");
  console.log(`     - 送金先 address: ${address}`);
  console.log(`     - chain: Base mainnet (chain id 8453)`);
  console.log(`     - asset: USDC contract = ${USDC_BASE_MAINNET}`);
  console.log(`     - 推奨送金額: $0.20 (verify $0.10 + 余裕 buffer)\n`);
  console.log("  2. 送金完了後、 再度本 script 実行: npm run verify:mainnet\n");
  console.log("  📝 ephemeral private key は .env.verify に保存済(gitignored、 流出 risk 低)");
  console.log("  📝 ephemeral wallet 残金は verify 終了後 焼却 or 別 turn で永井さま wallet に return\n");
}

async function payAndFetch(account: ReturnType<typeof privateKeyToAccount>): Promise<void> {
  const walletClient = createWalletClient({
    account,
    transport: http(),
    chain: base,
  });

  const paidFetch = wrapFetchWithPayment(fetch, walletClient as never, BUFFER_USDC);

  console.log("\n🚀 endpoint へ payment + resource fetch 試行 中...");
  const res = await paidFetch(ENDPOINT_URL);
  console.log(`📨 Response status: ${res.status}`);

  const body = await res.json();
  console.log(`📦 Response body:`);
  console.log(JSON.stringify(body, null, 2));

  const paymentResponseHeader = res.headers.get("X-Payment-Response");
  if (paymentResponseHeader) {
    try {
      const decoded = JSON.parse(Buffer.from(paymentResponseHeader, "base64").toString());
      console.log(`\n🔐 X-Payment-Response (transaction proof):`);
      console.log(JSON.stringify(decoded, null, 2));
      const txHash = decoded.transaction || decoded.transactionHash;
      if (txHash) {
        console.log(`\n✅ mainnet 物理証拠取得: https://basescan.io/tx/${txHash}`);
      }
    } catch {
      console.log(`\n⚠️  X-Payment-Response decode failed:`);
      console.log(paymentResponseHeader);
    }
  }

  console.log("\n✅ α path mainnet verify 完走!");
}

async function main(): Promise<void> {
  const pk = await loadOrGenerateKey();
  const account = privateKeyToAccount(pk);

  console.log(`\n📍 Ephemeral address: ${account.address}`);
  console.log(`🌐 Network: Base mainnet (chain id 8453)`);
  console.log(`🎯 Endpoint: ${ENDPOINT_URL}`);

  const balance = await checkBalance(account.address);
  console.log(`\n💰 USDC balance: ${formatUnits(balance, USDC_DECIMALS)} USDC`);
  console.log(`   Required (endpoint price): ${formatUnits(REQUIRED_USDC, USDC_DECIMALS)} USDC`);
  console.log(`   Buffer (recommended):      ${formatUnits(BUFFER_USDC, USDC_DECIMALS)} USDC`);

  if (balance < REQUIRED_USDC) {
    showFundingInstructions(account.address);
    process.exit(0);
  }

  await payAndFetch(account);
}

main().catch((err) => {
  console.error("❌ Error:");
  console.error(err);
  process.exit(1);
});
