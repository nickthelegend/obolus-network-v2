
# Irion Pay - Technical Specification

> **Status**: FINALIZED
> **Version**: 1.0.0
> **Last Updated**: 2026-02-19

## 1. Overview
Irion Pay (formerly "vault", "terminal" mix) is a multi-chain lending protocol aggregator and management dashboard. It allows users to interact with lending pools, manage collateral across chains via CCIP, and execute governance actions.

## 2. Core Requirements
- **Lending Pools Dashboard**: View TVL, APY, status of pools across multiple chains (Avalanche, Polygon, Ethereum, Base).
- **Cross-Chain Collateral**: Bridge collateral using Chainlink CCIP.
- **Data Persistence**: Move from frontend mock data to a robust database (Supabase).
- **Performance**: Serve data from DB to avoid slow on-chain reads during page load. Sync DB with chain data via background processes/serverless functions.

## 3. Database Schema (Supabase)
### `pools` Table
- `id`: UUID (Primary Key)
- `chain_id`: Integer (Chain ID, e.g., 43113 for Fuji)
- `chain_name`: String ("Avalanche Fuji", etc.)
- `asset_symbol`: String ("USDC", "WETH")
- `pool_type`: Enum/String ("MASTER", "SATELLITE")
- `apy`: Numeric (Annual Percentage Yield)
- `tvl`: Numeric (Total Value Locked in USD)
- `status`: String ("ACTIVE", "SYNCED", "BOOTSTRAP")
- `ccip_status`: String ("CORE", "LINKED", "PENDING")
- `last_updated`: Timestamp

## 4. API Endpoints
- `GET /api/pools`: Fetch all pools (supports filtering).
- `POST /api/pools/sync`: (Admin/Cron) Trigger on-chain data update.

## 5. Frontend
- **Pools Page**: Fetch data from `/api/pools` using React Query / SWR.
- **Components**: Replace static `MULTI_CHAIN_POOLS` array with API data.
