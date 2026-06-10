---
title: Prediction Organizations
description: Create and manage Prediction Market Organizations (PMOs)
---

Prediction Market Organizations (PMOs) are a special type of Bitshares asset that acts as an organizational entity for creating and managing prediction markets.

## What is a PMO?

A PMO is an asset on the Bitshares blockchain with a `pmo_object` in its description. It represents an organization that can:

- Create prediction markets under its brand
- Define governance and resolution policies
- Provide attestation and identity information
- Maintain a portfolio of linked predictions

## Browsing Organizations

Access the organizations view from **Predictions > Prediction Organizations**.

The listing page shows all PMO assets on the current chain with:

- **Organization identity** — Name, description, and symbol
- **Governance policy** — How the organization handles resolutions
- **Dispute mechanism** — How disputes are resolved
- **Attestation** — Verification information
- **Linked predictions** — Count of predictions created under this org

### Search and Sort

Use the search bar to filter organizations by name or symbol. Sort by different fields to find specific organizations.

### Owner Actions

If you own a PMO asset, you will see additional buttons:

- **Edit Organization** (amber) — Update the PMO's identity, governance, or metadata
- **Create Prediction** (fuchsia) — Create a new prediction market under this organization

## Creating a PMO

Access the creation wizard from **Predictions > Create PMA Organization**.

### Step 1: Organization Identity (Required)

- **Symbol** — The unique identifier for your organization (e.g., `MYORG`). Only alphanumeric characters allowed; dots are rejected
- **Description** — Text description of your organization

### Step 2: Organization Profile (Recommended)

This step captures the PMO-specific metadata:

**Identity:**
- **Organization name** — Display name
- **Website URL** — Organization website
- **Manifest URL** — Link to a JSON manifest with additional org details

**Governance:**
- **Resolution policy** — How your organization resolves predictions
- **Dispute mechanism** — How disputes are handled
- **On-chain account** — The account responsible for governance

**Attestation:**
- Verification and trust information for your organization

### Step 3: NFT Metadata (Optional)

Attach media and rich metadata to your organization asset, similar to prediction market NFT metadata.

## Linking Predictions to an Org

When creating a prediction in **Organization mode**, select your PMO from the dropdown. The prediction's symbol will be prefixed with your organization's symbol, creating a clear parent-child relationship.
