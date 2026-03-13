# Obolus Network: Cross-Chain Credit & BNPL 🌐⚡

Obolus is a decentralized credit protocol built for the **EVM ecosystem**, enabling users to leverage assets across multiple chains as collateral for instant **Buy Now, Pay Later (BNPL)** payments.

## 🏛️ Architecture

Obolus operates on a **Master/Satellite** model powered by **Chainlink CCIP**:

*   **Master Chain (Avalanche Fuji)**: Houses the global `CreditManager` and `DebtManager`. It maintains the source of truth for user credit limits and total debt.
*   **Satellite Chains (Polygon Amoy, etc.)**: Host `CollateralVault` contracts where users deposit assets. State changes are relayed to the Master chain via CCIP.

## 🛠️ Smart Contracts

| Contract | Role | Location |
| :--- | :--- | :--- |
| `CreditManager` | Master Registry for credit limits and LTV logic. | Avalanche Fuji |
| `DebtManager` | Tracks global debt and repayment status. | Avalanche Fuji |
| `BNPLRouter` | Executes payments to merchants using protocol liquidity. | Avalanche Fuji |
| `CollateralVault` | Locks user assets and triggers CCIP state updates. | Satellite Chains |
| `MasterCCIPReceiver` | Handles incoming state proofs from satellites. | Avalanche Fuji |

## 🚀 Getting Started

### Smart Contracts
```bash
cd Obolus-smart-contracts
npm install
npx hardhat test
```

### Frontend
```bash
cd Obolus-network
npm install
npm run dev
```

## 🗺️ Roadmap
See [roadmap.md](./roadmap.md) for the full implementation path.

