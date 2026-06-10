---
title: Browsing Predictions
description: How to find, filter, and explore prediction markets
---

The prediction market views let you browse all markets on the Bitshares blockchain. There are three main views accessible from the navigation:

## Active Predictions

The primary view showing all currently live prediction markets. These are markets that have not yet reached their resolution date.

### Filtering

You can narrow down the list using several filters:

- **Status** — Filter by market status such as active, closing soon, or newly created
- **Search** — Type text to search prediction condition descriptions
- **Date range** — Filter by creation date or resolution date
- **Issuer** — Click an issuer's avatar or badge in the prediction row to filter by that issuer. A clear filter button appears in the card header when a filter is active
- **Organization** — Filter predictions created under a specific PMO organization

### Sorting

Click column headers to sort by different fields. The sort direction toggles between ascending and descending.

### Prediction Details

Each prediction card shows:

- **Condition** — The question or statement being predicted on
- **Backing asset** — The asset used to back the prediction
- **Resolution date** — When the prediction will be resolved
- **Current status** — Active, closing soon, or expired
- **Issuer** — Who created the prediction (with avatar)
- **Organization badge** — If created under a PMO, the ORG badge is displayed

Prediction descriptions support HTML formatting and are sanitized for safety.

## My Predictions

Shows prediction markets where you have an active position or have placed orders. This is your personal view of predictions you are participating in.

## Expired Predictions

Shows prediction markets that have passed their resolution date. You can view the resolution outcome and see how the prediction was settled.

## URL Parameters

The prediction views support URL parameters for deep linking:

- `?sort=FIELD` — Pre-set the sort field
- `?filter=TERM` — Pre-fill the search filter
- `?issuer=ACCOUNT_ID` — Pre-filter by a specific issuer
