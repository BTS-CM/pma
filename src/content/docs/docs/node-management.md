---
title: Node Management
description: Configure and manage blockchain WebSocket node connections
---

Node management lets you configure which WebSocket nodes the UI connects to for blockchain data. Access it from **Settings > Nodes** in the navigation.

## How Nodes Work

The Bitshares blockchain is accessed through WebSocket nodes. These nodes provide:

- Account data and balances
- Asset information
- Order books and trade history
- Block data and transaction verification

The UI needs at least one working node to function. Each chain (mainnet and testnet) has its own set of nodes.

## Viewing Nodes

The nodes page displays all configured nodes with:

- **Node URL** — The WebSocket endpoint
- **Latency** — Response time in milliseconds
- **Status** — Online/offline indicator
- **Health** — Visual indicator of node responsiveness

## Adding Custom Nodes

You can add your own WebSocket nodes to the list:

1. Click the add button
2. Enter the WebSocket URL (e.g., `wss://node.example.com/ws`)
3. The node is added to the list and tested

## Testing Nodes

Click the ping button on any node to test its:

- **Availability** — Whether the node is online and responding
- **Latency** — How quickly the node responds
- **Block height** — The latest block the node has processed

## Switching Nodes

Select a different node to change which endpoint the UI uses for blockchain data. This is useful if:

- Your current node is slow or unresponsive
- You want to use a geographically closer node
- Your ISP blocks access to certain nodes

The UI automatically falls back to other nodes if the selected one becomes unavailable.

## Default Nodes

The UI ships with a set of default nodes for both mainnet and testnet. These are regularly tested and maintained. You can always return to the defaults if custom nodes stop working.
