# Obolus Network: Cross-Chain Credit & BNPL 🌐⚡

Obolus is a decentralized credit protocol built for the **EVM ecosystem**, enabling users to leverage assets across multiple chains as collateral for instant **Buy Now, Pay Later (BNPL)** payments.

This repository serves as the **Central Protocol Interface** for both users and merchants, housing the primary decentralized application (dApp).

## 🚀 Features

*   **User Dashboard**: Manage collateral deposits, request credit limits, view available credit, and track your active BNPL debt.
*   **Checkout Hub**: Serve as the central payment gateway for integrated merchants (like `obolus-shopping-app`) to facilitate secure, "one-click" Web3 checkouts.
*   **KYC & Verification**: Utilizes Reclaim Protocol (ZK Identity) to perform Sybil resistance, KYC, and proof-generation.

## 🏛️ Architecture

Obolus operates on a **Master/Satellite** model powered by **Chainlink CCIP**:

*   **Master Chain (Avalanche Fuji)**: Houses the global `CreditManager` and `DebtManager`. It maintains the source of truth for user credit limits and total debt.
*   **Satellite Chains (Polygon Amoy, Monad, Base)**: Host `CollateralVault` contracts where users deposit assets. State changes are relayed to the Master chain via CCIP.

## 🛠️ Tech Stack

This project is built using modern Web3 tools and frameworks to ensure extreme reliability, security, and a premium user experience:

*   **Framework**: [Next.js](https://nextjs.org/) (App Router) & [React](https://react.dev/)
*   **Web3 Integration**: [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/), and [RainbowKit](https://www.rainbowkit.com/) for flawless multi-wallet UX and RPC communication.
*   **Identity**: [Reclaim Protocol](https://www.reclaimprotocol.org/) for decentralized zero-knowledge proofs.
*   **Backend & Indexing**: [Supabase](https://supabase.com/) for fast, off-chain data caching and indexing.
*   **Styling**: Modern UI built with [Tailwind CSS v4](https://tailwindcss.com/), optimized [Radix UI primitives](https://www.radix-ui.com/), and [Framer Motion](https://www.framer.com/motion/) micro-animations.

## 🧑‍💻 Getting Started

You'll need a modern version of Node.js installed to run the dApp.

### 1. Installation

Clone this repo, then move into the `obolus-network` directory to install dependencies:

```bash
cd obolus-network
npm install
```

### 2. Environment Setup

Copy your environment file and fill it out:

```bash
cp .env.example .env
```

Ensure you configure your respective Web3 providers, Supabase URL, and project keys.

### 3. Run Locally

Start the Next.js development server:

```bash
npm run dev
```

The application should now be accessible at [http://localhost:3000](http://localhost:3000).

---

For the actual Smart Contracts providing the execution layer behind Obolus, please see the `obolus-smart-contracts-V2` repository in this workspace.

*Note: Obolus is currently deployed to testnets. Do not connect wallets holding real funds.*
