---
title: Deep Linking and QR Codes
description: Sign transactions externally using deep links and QR codes
---

The Bitshares Prediction Market UI uses a deep linking system to sign transactions. Instead of storing private keys, the UI generates transaction payloads that your wallet signs externally.

## How Deep Linking Works

1. **You perform an action** — Create a prediction, place a trade, transfer an asset, etc.
2. **The UI constructs the transaction** — Builds the full operation with all parameters and fees
3. **A deep link is generated** — A URL containing the serialized transaction payload
4. **Your wallet opens the link** — Beet, BeetEOS, or another compatible wallet
5. **You review and sign** — The wallet displays the transaction details for your approval
6. **The wallet broadcasts** — The signed transaction is sent to the blockchain

:::note
Your private keys never leave your wallet. The prediction market UI only constructs unsigned transactions.
:::

## Supported Operations

The deep link system supports all 40+ Bitshares operation types, including:

- Asset creation and updates
- Limit order create and cancel
- Account creation and management
- Liquidity pool operations
- Prediction market operations
- Witness and committee operations
- And many more

## Using Deep Links

After constructing a transaction, the deep link dialog shows:

- **Transaction details** — Full JSON payload for inspection
- **Deep link tab** — The URL your wallet will open
- **QR code tab** — A scannable QR code for mobile wallets

## QR Code Signing

For air-gapped or mobile wallet signing:

1. Switch to the **QR Code** tab in the deep link dialog
2. Scan the QR code with your mobile wallet
3. The wallet displays the transaction for review
4. Sign and broadcast from the mobile wallet

## Transaction Inspection

Click the JSON details button to inspect the raw transaction data before signing. This shows:

- All operation parameters
- Fee calculations
- On-fill hooks (for limit orders)
- Memo encryption details

## Use Cases

Deep linking is used throughout the app for:

- **Prediction creation** — Sign the asset creation transaction
- **Placing orders** — Sign limit order transactions
- **Transfers** — Sign asset transfer transactions
- **Account creation** — Sign account registration
- **Order cancellation** — Sign cancel operations
- **Organization management** — Sign PMO create/update operations
