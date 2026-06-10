---
title: Content Moderation
description: Global and personal blocklists for filtering bad actors
---

The Bitshares Prediction Market UI includes a dual-layer content moderation system designed to protect users from malicious accounts and spam.

## Global Blocklist

The global blocklist is a community-maintained list of accounts flagged for malicious behavior.

### How It Works

- **Source** — Fetched from the Bitshares blockchain data
- **Update frequency** — Automatically refreshed every 24 hours
- **Scope** — Applies to all users of the application
- **Read-only** — Individual users cannot modify the global list

### What Blocking Does

Accounts on the global blocklist have their:

- Assets filtered from swap and trade views
- Liquidity pools hidden from pool listings
- Predictions excluded from browse views

### Privacy Protection

Account names on the global blocklist are hashed using SHA-256 before storage and comparison. This means:

- Plaintext account names are not stored locally
- The blocklist cannot be easily read by someone with access to your device
- Comparisons use cryptographic hashes for consistency

## Personal Blocklist

Your personal blocklist lets you block specific accounts that you do not want to see.

### Adding to Your Blocklist

1. Navigate to **Settings > Blocked Users**
2. Click the add button
3. Search for the account by name
4. Select the account to block it

### Removing from Your Blocklist

Remove accounts from your personal blocklist at any time from the same page.

### Per-Chain Storage

Your personal blocklist is stored separately for each chain:

- Mainnet blocklist
- Testnet blocklist

This ensures that blocking a user on testnet does not affect your mainnet experience, and vice versa.

### Persistence

Your personal blocklist is stored in local storage and persists across app restarts.

## How Blocking Affects Your Experience

When a user is blocked (either globally or personally):

- Their assets do not appear in swap/trade asset selectors
- Their liquidity pools are hidden from pool listings
- Their predictions are filtered from browse views
- Their user profiles are not displayed in search results

Blocking is a local filter — it only affects what you see in the UI. It does not affect the blockchain itself or other users' experiences.
