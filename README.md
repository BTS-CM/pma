<img width="1900" height="2250" alt="image" src="https://github.com/user-attachments/assets/c9e73ba8-0473-4646-a14d-debe42d2cb68" />

# Bitshares Prediction Markets UI

A focused desktop app for **creating, trading and settling [Bitshares](https://bts.exchange) Prediction Market Assets (PMAs)**.

Created using [Astro](https://docs.astro.build), [React](https://react.dev/), [Shadcn/ui](https://ui.shadcn.com/docs) & [Electron](https://www.electronjs.org).

Integrates with both the [Beet](https://github.com/bitshares/beet) and [BeetEOS](https://github.com/beetapp/beeteos) multiwallets, for the Bitshares and Bitshares Testnet blockchains.

## What is a Prediction Market Asset?

A Prediction Market Asset (PMA) is a special kind of Bitshares smartcoin that lets the chain itself act as a prediction market. Instead of betting against a counterparty or trusting a centralised oracle, the market's participants collectively drive the asset's price toward the real-world outcome they expect.

Each PMA is created with a plain-English `condition` and `expiry` written into the asset description, e.g. *"Will SpaceX land on Mars by 2027?"*. The market resolves via two complementary mechanisms:

- **Price feed** — A designated feed publisher (or a committee feed) sets a settlement price for the asset between 0 and 1. `1.0` means the condition is true / has happened; `0.0` means false / didn't happen; values in between represent partial confidence.
- **Global settlement (resolution)** — When a prediction expires, the creator (or a price feeder) resolves it by triggering global settlement at the outcome price: `1.0` for YES (true) or `0.0` for NO (false). This is how the market closes and winners are determined.

PMAs are tradable like any other asset on the Bitshares DEX, and they support the full limit-order and cancel flow. After a PMA is resolved, winning holders settle their tokens for the backing collateral — so being "on the right side of the price" means you win.

## What can you do with this app?

The app is organised around the full lifecycle of a prediction market asset, from creation to settlement.

### Creating PMAs
- **Launch a new market** — define a custom ticker, set a description, condition and expiry, choose a feed publisher (yourself, another account, or the committee), and decide the initial feed parameters. The backing asset is fixed to the chain's core asset (BTS on mainnet, TEST on testnet) — no manual selection needed. The whole PMA is created in a single transaction.

### Prediction Market Organizations (PMOs)
- **Create a PMO** — register a top-level asset symbol (e.g., `MYORG`) that acts as an organizational brand. The PMO stores a `pmo_object` in its description with governance policy, resolution method, website, and verification details — serving as decentralized Terms of Service.
- **Sub-assets under PMO** — create prediction markets as sub-assets (e.g., `MYORG.ELECTION2024`) at reduced fees. Investors can verify the issuing organization by checking the parent asset's PMO object.
- **Organization management** — PMO owners can edit organization metadata, governance policy, and create new predictions directly from the organization view.
- **Browse organizations** — dedicated page listing all PMOs with active/expired prediction counts, governance policy, and quick links to their markets.

### Managing your markets
- **Issued assets view** — see every prediction market asset you've created, filterable by status (active, expired, settled), with quick actions to update the description, edit the feed producer, or trigger a global settlement.
- **Issuer controls** — as the creator of a PMA, you can adjust its description, change the price feeders, or resolve the prediction once it expires.

### Trading and betting
- **DEX limit orders** — buy or sell any PMA against its backing collateral on the Bitshares DEX, with full support for limit orders, partial fills, and cancellation.
- **Place a bet** — a streamlined flow for buying PMA outright (i.e. taking a "yes" or "no" position) without having to construct a limit order manually. The app shows you the current implied probability based on the order book and recent trades.
- **Live odds display** — when buying or selling PMA, the app shows estimated odds derived from the live DEX limit order book (mid-price) with fallback to recent trade price. Odds shown in **Fractional**, **Decimal**, **American**, and **Implied probability** formats. Updates in real-time as the order book changes.
- **Cancel orders** — every open order has a one-click cancel, with a confirmation dialog showing the order ID and a deep link to broadcast the cancellation on Beet/BeetEOS.

### Portfolio & Views
- **Balances** — see all of your holdings, with the prediction market assets (and the collateral that backs them) clearly highlighted.
- **Activity** — a history of your trades, transfers and settlements.
- **Open orders** — every limit order you have on the book, with a live countdown to each order's expiry, a copyable order ID, and one-click cancel. Includes a manual **Refresh** button that busts the cache and re-fetches from the chain with a loading indicator.
- **Active Predictions** — browse live, unresolved markets accepting bets, filterable by closing soon or newest.
- **Expired Predictions** — past markets awaiting resolution by price feeders or creator.
- **My Predictions** — markets you've created or interacted with (hold positions/orders).
- **Prediction Portfolio** — PMA tokens currently held in your balance, with unrealised PnL tracking and quick settle/sell actions.
- **Prediction Margin** — open margin (call) positions on PMAs with collateral ratio monitoring.

### Settlement
- **Resolve predictions** — after a prediction expires, the creator (or designated price feeder) resolves it by triggering global settlement at the outcome price (1.0 for YES, 0.0 for NO). This marks the market as resolved and determines which side wins.
- **Claim winnings** — once a prediction is resolved, winning PMA holders (those who bought YES and the outcome is true, or sold NO and the outcome is false) can settle their tokens 1:1 for the backing asset collateral. Sellers who won receive their backing collateral back automatically.

## Supporting features

Beyond the prediction-market workflow, the app includes a small set of utilities you'll need to actually use it day-to-day:

- **Favourites** — pin assets, accounts and trading pairs for quick access. Favourites persist across sessions and are scoped to each chain.
- **Transfers** — send assets to other Bitshares accounts, with memo support.
- **Instant Trading** - instantly exchange between trading pairs on the DEX
- **Advanced DEX limit orders** - trade between any two assets using advanced features
- **Simple Pool Swaps** - perform a quick pool asset swap
- **Account blocklist** - block accounts you dont like.
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
