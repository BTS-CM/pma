---
title: Creating Accounts
description: Register new Bitshares accounts via faucet or LTM
---

The account creation page lets you register new Bitshares accounts. Access it from **Settings > Create Account** in the navigation.

## Creation Methods

### Method 1: Faucet Registration

The simplest way to create an account. The faucet API handles account creation on your behalf.

**Requirements:**
- Username must end with a digit (e.g., `myaccount1`)
- A small network fee applies

**Steps:**
1. Enter your desired username (must end with a digit)
2. Click to check username availability
3. Review the auto-generated password
4. Acknowledge the safety checkboxes
5. Submit to register via the faucet

## Password Security

When using the faucet method, the UI generates a secure password:

- Generated using cryptographic randomness via Electron
- **Copy** the password to a secure location immediately
- **Toggle visibility** to view the password
- **Regenerate** if you need a new one

:::caution
Your password is generated locally and is never stored anywhere. If you lose it, there is no way to recover your account. Write it down and store it securely.
:::

## Username Validation

- Usernames are checked for availability in real-time
- The availability check queries the blockchain directly
- Usernames must follow Bitshares naming rules

## Safety Acknowledgments

Before creating an account, you must acknowledge:

1. If you lose your password, you lose access to the account permanently
2. There is no account recovery mechanism
3. You have securely saved your credentials

These checkboxes ensure you understand the self-custodial nature of Bitshares accounts.
