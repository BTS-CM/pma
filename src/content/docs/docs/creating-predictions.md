---
title: Creating Predictions
description: How to create your own prediction market on Bitshares
---

The prediction creation wizard guides you through launching a new prediction market asset on the Bitshares blockchain. Access it from the navigation under **Predictions > Create Prediction**.

## Creation Modes

### Manual Mode
Create a prediction market asset directly with a custom symbol. You define the full asset identifier yourself.

### Organization Mode
Create a prediction market under an existing Prediction Market Organization (PMO). The asset symbol will be prefixed with the organization's symbol (e.g., `ORG.SYMBOL`). A dropdown shows your owned PMO assets. If you own PMO assets, the UI defaults to organization mode if the chosen user owns one.

## The Creation Wizard

### Step 1: Asset Identity

- **Symbol** — The unique identifier for your prediction asset (e.g., `BTC100K.DEC`).
- **Description** — A description of the prediction market.

### Step 2: Prediction Details

- **Condition/Question** — The prediction statement (e.g., "Will Bitcoin exceed $100k by December 2025?")
- **Resolution date and time** — When the prediction will be resolved
- **Backing asset** — The asset used to back the prediction. Select from available assets on the current chain
- **Market fee percentage** — Commission charged on trades of this prediction

### Step 3: Asset Permissions and Flags

Configure advanced asset properties:

- Whitelist authorities
- Transfer restrictions
- Witness-fed or committee-fed status
- Confidential flags

These can typically be left at defaults.

### Step 4: Extensions

- **Referrer reward percentage** — Reward for referring new holders
- **Fee sharing whitelist** — Accounts eligible for fee sharing
- **Taker fee percentage** — Custom taker fee for this asset

### Step 5: NFT Metadata (Optional)

Attach rich metadata to your prediction:

- **Title** — Display title
- **Artist/Creator** — The creator's name or identity
- **Narrative** — Extended description
- **Tags** — Comma-separated tags for categorization
- **Type** — The type of prediction (text, video, audio, image, etc.)
- **Media** — IPFS links for associated media files (images, video, audio, documents, 3D models)

### Step 6: Summary and Submit

Review all your settings. The UI shows a fee estimation based on the symbol length and transaction complexity. When ready, a deep link is generated for your wallet to sign and broadcast the transaction.

## Signing the Transaction

The creation wizard does not sign transactions directly. Instead, it generates a **deep link** that your wallet (Beet or BeetEOS) uses to:

1. Display the full transaction details
2. Prompt you to sign with your private key
3. Broadcast the signed transaction to the blockchain