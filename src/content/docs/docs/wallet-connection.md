---
title: Wallet Connection
description: How to connect your wallet and start using the application
---

The Bitshares Prediction Market UI uses a zero-authentication model. You do not log in with a username and password. Instead, your wallet handles all signing and authorization.

## Supported Wallets

### Beet Desktop
The primary supported wallet. Beet provides full integration with the prediction market UI for signing transactions, managing accounts, and broadcasting operations.

### BeetEOS
An alternative wallet that provides similar capabilities for signing and broadcasting blockchain operations.

## How It Works

1. Open the prediction market UI
2. Your wallet (Beet or BeetEOS) must be running on the same machine
3. The UI communicates with the wallet via deep links or JSON payloads
4. When you perform an action (transfer, create prediction, place an order), the UI constructs the transaction and sends it to your wallet for signing
5. Your wallet signs the transaction locally and broadcasts it to the blockchain

**Your private keys never leave your wallet.** The prediction market UI never has access to your keys.

## Without a Wallet

You can still use the UI to:

- Browse prediction markets
- View asset data and order books
- Inspect blockchain objects

However, you will not be able to:

- Place trades or orders
- Create predictions or organizations
- Transfer assets
- Create accounts
