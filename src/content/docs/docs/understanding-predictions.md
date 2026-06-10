---
title: Understanding Predictions
description: How prediction markets work on Bitshares
---

Prediction markets on Bitshares are a special type of asset that represents a conditional outcome. They allow users to speculate on whether a particular event will occur.

## How It Works

A prediction market asset on Bitshares has:

1. **A condition** — A question or statement (e.g., "Will Bitcoin exceed $100k by December 2025?")
2. **A backing asset** — An asset that provides economic backing for the prediction
3. **A resolution date** — When the prediction will be resolved and settled
4. **A resolution outcome** — Whether the condition was true or false

When the resolution date passes, the prediction is resolved. If you hold a position and the outcome goes your way, you profit. If not, you lose your backing.

## Prediction Market Assets

On the Bitshares blockchain, prediction markets are standard assets with a special `prediction_market` flag set to true. They follow the same rules as other assets:

- They have a symbol (e.g., `BTC100K.DEC`)
- They have a precision and max supply
- They can be traded on the DEX
- They can have NFT metadata attached

## Backing Assets

The backing asset is what gives a prediction market its value. When you buy a prediction token, you are essentially buying the right to a payout if the prediction resolves in your favor.

The backing asset is selected when the prediction is created. Common choices include stablecoins or other liquid Bitshares assets.

## Resolution

Predictions are manually resolved by the prediction creator after the resolution date has passed.

Look into the prediction market organization details how how the prediction creator handles resolution.

## Creating Your Own

See [Creating Predictions](/docs/creating-predictions.html) to learn how to launch your own prediction market on Bitshares.

## Organizations

Prediction Market Organizations (PMOs) allow groups to create and manage collections of predictions under a shared identity. See [Prediction Organizations](/docs/prediction-organizations.html) for more.
