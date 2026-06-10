---
title: The DEX
description: Use the built-in decentralized exchange for limit and market orders
---

The Decentralized Exchange (DEX) is the core trading interface of the Bitshares blockchain. Access it from **Exchange > DEX** in the navigation.

## Selecting a Market

Choose two assets to trade between using the asset dropdown selectors. The DEX supports all assets listed on the Bitshares blockchain.

You can also navigate directly to a market using URL parameters:

```
/dex/?market=ASSET_A_ASSET_B
```

The UI automatically detects if a market is inverted and adjusts the display accordingly.

## Order Book

The order book shows all open limit orders for the selected market:

- **Bids** (buy orders) — Shown on one side with cumulative totals
- **Asks** (sell orders) — Shown on the other side with cumulative totals
- **Spread** — The difference between the best bid and best ask

Click on a price in the order book to pre-fill that price in your order form.

## Placing Limit Orders

A limit order lets you specify the exact price at which you want to buy or sell:

1. Select buy or sell
2. Enter the **amount** you want to trade
3. Enter the **price** you are willing to pay
4. Optionally set an **expiration** time
5. Review the order details
6. Submit via deep link for your wallet to sign

## Market Orders

Market orders execute immediately at the best available price in the order book. They are useful when you want to fill quickly rather than waiting for a specific price.

## Market Information

The DEX view includes several information panels:

- **Asset info** — Details about each asset in the market
- **Sparkline chart** — Price history visualization
- **Trade history** — Recent trades on this market
- **Your orders** — Your open orders on this market
- **Your trades** — Your completed trades on this market

## Viewing Orders

The **My Open Orders** tab shows all your pending orders on the current market. You can cancel individual orders directly from this view.

The **My Completed Trades** tab shows your trade history for the selected market.

## JSON Inspection

Click on any limit order to view its raw JSON data. This is useful for advanced users who want to inspect on-fill hooks, maker/taker fees, and other on-chain details.
