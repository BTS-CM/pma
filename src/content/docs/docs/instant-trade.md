---
title: Instant Trade
description: One-click fill-or-kill trading against existing limit orders
---

Instant Trade provides a streamlined trading experience where your order is matched against existing limit orders in the order book and filled immediately.

Access it from **Exchange > Instant Trade** in the navigation.

## How It Works

Unlike regular DEX trading where you place a limit order and wait for someone to fill it, Instant Trade:

1. Scans the order book for matching limit orders
2. Fills your trade against those orders
3. Executes as a fill-or-kill — either completely filled or rejected

## Buy and Sell Modes

### Buy Mode
Purchase an asset by matching against existing sell (ask) orders. The UI automatically walks up the order book until your order is fully filled.

### Sell Mode
Sell an asset by matching against existing buy (bid) orders. Again, the UI matches against the best available prices.

## Trade Methods

### Single Limit Order
Your entire trade fills against a single existing limit order. This gives you a predictable execution price.

### Multiple Limit Orders
Your trade is split across multiple limit orders in the order book. This can result in a better average price when the order book has depth at multiple price levels.

## Information Displayed

When reviewing a potential instant trade, the UI shows:

- **Average effective price** — The weighted average price across all fills
- **Number of limit orders consumed** — How many existing orders your trade matches against
- **Unique sellers/buyers** — How many counterparties you are trading with
- **Network fee** — The blockchain transaction fee
- **Market fee** — Any applicable market fees on the traded asset

## MAX Button

Use the **MAX** button to automatically fill in the maximum amount you can trade with your available balance.

## Submitting the Trade

After reviewing the details, the UI generates a deep link for your wallet. Your wallet will:

1. Display the full transaction with all matched orders
2. Prompt you to sign
3. Broadcast the signed transaction

You can also use the **QR code** tab to scan from a mobile wallet.

## Order Details

Click on any of the matched limit orders to inspect the raw JSON data. This shows the full order details including on-fill hooks (smart contract logic attached to orders).
