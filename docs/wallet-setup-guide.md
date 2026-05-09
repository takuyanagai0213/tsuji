# Wallet setup guide

## Recommended: Coinbase Wallet(Base network)

x402 = Coinbase Developer Platform 製品、 Base chain integrate 最良 + USDC 公式 issuer Circle と整合。

## Setup steps(5 分)

1. App Store / Google Play で **Coinbase Wallet** インストール(Coinbase 本体 app と別 app、 wallet 専用)
2. 起動 → 「新しい wallet を作成」 → seed phrase 12 単語控える(永井さま個人 secure store に保管、 紙 + 1Password / Bitwarden 等)
3. wallet 作成完了後、 Settings → Network → **Base** 選択
4. wallet address copy(`0x...` 42 文字)
5. takuyanagai0213/README.md の「### Wallet(Phase 1+)」 section の TBD 箇所に address paste

## Alternative wallets

- **Phantom**: Solana 主体、 multi-chain 対応
- **Rainbow**: Ethereum + L2 主体
- **Argent**: zkSync 等 L2 特化

## Privacy 考慮

USDC wallet address 公開 = 入金受信 only(永井さま個人秘密鍵は wallet app 内で保護)、 漏洩 risk なし。 ただし wallet address 公開 = on-chain transaction 履歴 public 化、 永井さま全 USDC transaction が誰でも閲覧可能になる前提で判断。

私見では Phase 0 受付 signal として OK、 ただし complete privacy が必要なら Phase 1 後にしてから wallet 取得 / 公開判断する path もあり。

## 日本円換金 path(別フロー)

USDC が wallet に入っただけでは銀行口座に円は届きません:

1. Coinbase Wallet → Coinbase 本体取引所(coinbase.com)へ USDC 送金
2. coinbase.com で USDC → USD 売却
3. USD → JPY 換金 + 銀行送金

または:

1. Coinbase Wallet → bitFlyer / GMO コイン等の国内取引所へ USDC 送金(対応 chain 確認必要)
2. 国内取引所で USDC → JPY 売却 + 銀行送金

つまり **wallet 入金 = on-chain で即時(2 秒)、 銀行口座入金 = 数日かかる別フロー**。

## 関連

- [Coinbase Wallet 公式](https://www.coinbase.com/wallet)
- [Base chain 公式](https://base.org/)
- [USDC 公式(Circle)](https://www.circle.com/usdc)
