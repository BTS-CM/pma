---
title: Simple Swap
description: Swap tokens through liquidity pools (AMM)
---

Simple Swap provides a token swap interface powered by Bitshares liquidity pools.

Access it from **Exchange > Simple Swap** in the navigation.

## How Liquidity Pool Swaps Work

Instead of trading against individual limit orders, Simple Swap trades against liquidity pools. A liquidity pool is a smart contract that holds a pair of assets and provides automatic pricing based on the ratio of assets in the pool.

## Selecting a Pool

Choose a liquidity pool to swap through. The UI shows:

- **Pool ID** — The on-chain identifier
- **Asset pair** — The two assets in the pool
- **Fee percentage** — The pool's swap fee
- **Available liquidity** — The balance of each asset in the pool

When multiple pools exist for the same asset pair, you can compare fees and liquidity to choose the best one.

## Making a Swap

1. **Select the pool** — Choose which liquidity pool to use
2. **Enter the amount** — Specify how much of the source asset you want to swap
3. **Review the output** — See the estimated amount of the destination asset you will receive
4. **Check the rate** — The real-time exchange rate is displayed
5. **Submit** — Generate a deep link for your wallet to sign

## Fee Breakdown

The UI displays a complete fee breakdown:

- **Pool fee** — The liquidity provider fee (percentage of the trade)
- **Network fee** — The blockchain transaction fee
- **Market fee** — Any market fees on the traded assets
- **Effective rate** — The actual rate you get after all fees

## MAX Button

Use the **MAX** button to automatically fill in the maximum amount you can swap from your available balance.

## Exchange Rate

The exchange rate is calculated based on the current ratio of assets in the pool. Larger trades will move the price more (slippage). The UI shows the expected output before you confirm.

## Comparing Pools

If multiple pools exist for the same asset pair, the UI lets you compare:

- Fee percentages (lower is better)
- Liquidity depth (more liquidity means less slippage)
- Effective exchange rate
