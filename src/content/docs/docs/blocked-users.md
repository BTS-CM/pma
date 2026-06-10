---
title: Blocked Users
description: Manage global and personal blocklists to filter content
---

The blocked users feature provides a dual-layer content moderation system to keep your experience safe. Access it from **Settings > Blocked Users** in the navigation.

## How Blocking Works

When you block a user, their assets and liquidity pools are filtered from:

- Swap and trade views
- Liquidity pool listings
- Other views where their content might appear

## Two Levels of Blocking

### Global Blocklist

The global blocklist is fetched directly from the Bitshares blockchain. It contains accounts that have been flagged by the community or network governance.

- **Automatically updated** — Refreshed every 24 hours
- **Privacy-preserving** — Account names are hashed using SHA-256 before comparison
- **Chain-specific** — Separate blocklists for mainnet and testnet
- **Read-only** — You cannot modify the global blocklist

### Personal Blocklist

Your personal blocklist contains accounts you have manually blocked.

- **User-managed** — Add or remove accounts at any time
- **Chain-specific** — Separate lists for mainnet and testnet
- **Persistent** — Stored locally and survives app restarts

## Adding Users to Your Blocklist

1. Navigate to **Settings > Blocked Users**
2. Click the add button
3. Use the account search dialog to find the account
4. Select the account to add it to your blocklist

## Removing Users

Remove accounts from your personal blocklist at any time. Global blocklist entries cannot be removed from the UI.

## Privacy

The blocking system uses SHA-256 hashing for account names. This means:

- Your blocklist does not store plaintext account names on disk
- Comparisons happen using hashed values
- The global blocklist uses the same hashing for consistency
