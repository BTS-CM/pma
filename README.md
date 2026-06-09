<img width="1919" height="1038" alt="image" src="https://github.com/user-attachments/assets/8911d0e5-97c1-4f83-af37-b93e0aff270f" />

# Bitshares Prediction Markets UI

A focused desktop app for **creating, trading and settling [Bitshares](https://bts.exchange) Prediction Market Assets (PMAs)**.

Created using [Astro](https://docs.astro.build), [React](https://react.dev/), [Shadcn/ui](https://ui.shadcn.com/docs) & [Electron](https://www.electronjs.org).

Integrates with both the [Beet](https://github.com/bitshares/beet) and [BeetEOS](https://github.com/beetapp/beeteos) multiwallets, for the Bitshares and Bitshares Testnet blockchains.

## What is a Prediction Market Asset?

A Prediction Market Asset (PMA) is a special kind of Bitshares smartcoin that lets the chain itself act as a prediction market. Instead of betting against a counterparty or trusting a centralised oracle, the market's participants collectively drive the asset's price toward the real-world outcome they expect.

Each PMA is created with a plain-English `condition` and `expiry` written into the asset description, e.g. *"Will SpaceX land on Mars by 2027?"*. The market resolves via two complementary mechanisms:

- **Price feed** — A designated feed publisher (or a committee feed) sets a settlement price for the asset between 0 and 1. `1.0` means the condition is true / has happened; `0.0` means false / didn't happen; values in between represent partial confidence.
- **Global settlement (collateral bids)** — When the price feed stalls or the market wants to wind down, the chain auctions the PMA's backing collateral to the highest bidder. This is the "last-resort" resolution path that guarantees every open position can always be closed.

PMAs are tradable like any other asset on the Bitshares DEX, and they support the full limit-order and cancel flow. When a PMA settles, every holder of the asset ends up holding an equivalent amount of its backing collateral — so winning a bet is just "be on the right side of the price".

## What can you do with this app?

The app is organised around the full lifecycle of a prediction market asset, from creation to settlement.

### Creating PMAs
- **Launch a new market** — define a custom ticker, set a description, condition and expiry, pick a backing collateral asset, choose a feed publisher (yourself, another account, or the committee), and decide the initial feed parameters. The whole PMA is created in a single transaction.

### Managing your markets
- **Issued assets view** — see every prediction market asset you've created, filterable by status (active, expired, settled), with quick actions to update the description, edit the feed producer, or trigger a global settlement.
- **Issuer controls** — as the creator of a PMA, you can adjust its description, change the feed producer, force a global settlement, or open the asset for collateral bids on demand.

### Trading and betting
- **DEX limit orders** — buy or sell any PMA against its backing collateral on the Bitshares DEX, with full support for limit orders, partial fills, and cancellation.
- **Place a bet** — a streamlined flow for buying PMA outright (i.e. taking a "yes" or "no" position) without having to construct a limit order manually. The app shows you the current implied probability based on the order book and recent trades.
- **Cancel orders** — every open order has a one-click cancel, with a confirmation dialog showing the order ID and a deep link to broadcast the cancellation on Beet/BeetEOS.

### Portfolio
- **Balances** — see all of your holdings, with the prediction market assets (and the collateral that backs them) clearly highlighted.
- **Activity** — a history of your trades, transfers and settlements.
- **Open orders** — every limit order you have on the book, with a live countdown to each order's expiry, a copyable order ID, and one-click cancel. Includes a manual **Refresh** button that busts the cache and re-fetches from the chain with a loading indicator.

### Settlement
- **Global settlement (collateral bids)** — if a PMA is stalled or you want to force a resolution, place a collateral bid on the global-settlement engine. The chain auctions the backing collateral to the highest bidder, and the winning bidder ends up holding the collateral outright.

### Top markets
- **24-hour market rankings** — the most-traded PMAs on the chain over the last 24 hours, sorted by volume. Useful for spotting trending markets or for finding liquidity.

## Supporting features

Beyond the prediction-market workflow, the app includes a small set of utilities you'll need to actually use it day-to-day:

- **Favourites** — pin assets, accounts and trading pairs for quick access. Favourites persist across sessions and are scoped to each chain.
- **Transfers** — send assets to other Bitshares accounts, with memo support.
- **Top markets** — see what's hot in the last 24 hours.
- **Multi-language** — fully translated to 10 languages (English, German, Danish, Spanish, Estonian, French, Italian, Japanese, Korean, Portuguese, Thai).
- **Multi-wallet** — works with both Beet (Bitshares mainnet) and BeetEOS (Bitshares Testnet).
- **Customisable visuals** — a `/visuals` settings page lets you tune the header wave animation, aurora, particle field, blur and colour palette, with live previews and a reset-to-defaults button.

## Download

Check out the latest releases:
https://github.com/BTS-CM/pma/releases

Supports Windows, Linux and Mac OSX.

## Dev Commands

All commands are run from the root of the project, from a terminal:

| Command                                | Action                                           |
| :------------------------------------- | :----------------------------------------------- |
| `npm install`                          | Installs dependencies                            |
| `npm run initData`                     | Fetches and stores JSON data for use in the app. |
| `npm run dev`                          | Starts local dev server at `localhost:4321`      |
| `npm run build:astro`                  | Builds the production site at `./dist/`          |
| `npm run start`                        | Runs the electron app in dev mode.               |
| `npm run build:astro \| npm run start` | Builds then runs the electorn app in dev mode.   |
| `npm run dist:windows-latest`          | Builds the windows application.                  |

## Credits

- Upstream project: [BTS-CM/astro-ui](https://github.com/BTS-CM/astro-ui) by the BeetEOS team and contributors — the full-featured Bitshares UI this fork is built on.
- This fork is a focused derivative aimed at Prediction Market Assets on Bitshares.
