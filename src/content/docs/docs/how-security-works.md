---
title: How Security Works
description: Understanding the zero-authentication security model
---

The Bitshares Prediction Market UI uses a zero-authentication security model. This means you never log in with a username and password, and your private keys are never exposed to the application.

## Zero Authentication

Unlike traditional web applications that require you to enter credentials, this UI works differently:

1. **No login required** — You can browse all public blockchain data without authenticating
2. **No key storage** — The application never stores, sees, or handles your private keys
3. **Local signing** — All transaction signing happens in your wallet (Beet, BeetEOS)
4. **Deep link transport** — Unsigned transactions are passed to your wallet via deep links or QR codes

## How Transactions Are Signed

When you perform an action that requires blockchain authorization:

1. The UI constructs the full transaction (operations, fees, parameters)
2. The transaction is serialized into a deep link payload
3. Your wallet receives the payload and displays it for review
4. You approve the transaction in your wallet
5. The wallet signs the transaction with your private key
6. The signed transaction is broadcast to the blockchain

**At no point does the prediction market UI have access to your private keys.**

## What This Means for You

### Benefits
- **No password to manage** — Your wallet handles authentication
- **No account to hack** — There is no centralized credential store
- **Air-gap compatible** — You can use QR codes to sign from an offline device
- **Multi-wallet support** — Use whichever wallet you trust

### Responsibilities
- **Secure your wallet** — If you lose access to your wallet, you lose access to your accounts
- **No recovery** — There is no password reset or account recovery mechanism
- **Backup your keys** — Ensure your wallet's backup is secure and accessible

## Transaction Verification

Every transaction is constructed transparently. Before signing, you can:

- Inspect the full JSON payload
- Verify all operation parameters
- Check fee calculations
- Review memo content

This transparency ensures you always know exactly what you are authorizing.
