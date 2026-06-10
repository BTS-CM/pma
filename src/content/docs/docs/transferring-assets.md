---
title: Transferring Assets
description: Send assets to other Bitshares accounts
---

The transfer feature lets you send any Bitshares asset to another account. Access it from **Exchange > Transfer** in the navigation.

## Sending an Asset

### Step 1: Select the Recipient

Enter the recipient's account name. Use the account search dialog to find accounts by name. You can also pre-fill the recipient via URL parameter:

```
/transfer/?to=ACCOUNT_NAME
```

### Step 2: Choose the Asset

Select which asset you want to send from your available balances.

### Step 3: Enter the Amount

Specify the amount to transfer. The UI validates that you have sufficient balance.

### Step 4: Add a Memo (Optional)

Add an encrypted memo to the transfer. Memos are encrypted between you and the recipient using memo keys. Only the sender and recipient can read the memo content.

### Step 5: Review and Submit

Review the transfer details:

- **Recipient** — Account name and avatar
- **Amount** — Asset and quantity
- **Memo** — Encrypted message (if added)
- **Network fee** — Base fee plus per-kilobyte data fee
- **Referrer rebate** — If self-referring, you receive an 80% rebate on the referral fee

Submit via deep link for your wallet to sign and broadcast.

## Fee Structure

Transfer fees consist of:

- **Base fee** — A fixed fee for the transfer operation
- **Data fee** — Additional fee based on the size of the memo (per kilobyte)
- **Referrer rebate** — When you refer yourself, 80% of the referral fee is returned to you

## Deep Link and QR Code

The transfer generates a deep link containing the full transaction payload. Your wallet displays the transaction details and prompts you to sign.

Switch to the **QR Code** tab to scan from a mobile wallet instead.
