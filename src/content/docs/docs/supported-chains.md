---
title: Supported Chains
description: Learn about Bitshares mainnet and testnet support
---

The Bitshares Prediction Market UI supports two blockchain networks:

## Bitshares Mainnet

The primary Bitshares network where real assets are traded. All prediction markets, liquidity pools, and account data on mainnet represent live economic activity.

## Bitshares Testnet

A parallel testing network with no real economic value. Use testnet to:

- Try out features without risking real assets
- Test transaction workflows before committing on mainnet
- Experiment with account creation and asset management

## Switching Chains

You can switch between mainnet and testnet at any time. Each network maintains its own:

- **Node connections** — WebSocket endpoints are chain-specific
- **Asset data** — Assets on mainnet and testnet are separate
- **Account data** — Your balances and orders are independent per chain
- **Blocklist** — Blocked users are tracked separately per chain

When you switch chains, the UI automatically loads the correct data for that network. Your preferences (favourites, visual settings, blocked users) persist across chain switches.

## Node Management

Each chain requires at least one working WebSocket node. The UI comes with default nodes, but you can add custom nodes and test their latency. See [Node Management](/docs/node-management/) for details.
