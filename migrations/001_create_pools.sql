-- Migration: Create pools table and seed data
-- Description: Sets up the structure for Lending Pools and populates it with the LINKED CONTRACT ADDRESSES from Hardhat deployment.

-- 1. Create the pools table
CREATE TABLE IF NOT EXISTS public.pools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- e.g. "avax-usdc"
    chain_name TEXT NOT NULL,
    chain_id INTEGER, -- Optional, good for future strictness
    asset_symbol TEXT NOT NULL,
    pool_type TEXT NOT NULL CHECK (pool_type IN ('MASTER', 'SATELLITE')),
    apy NUMERIC(5, 2) DEFAULT 0, -- e.g. 5.20 for 5.2%
    tvl NUMERIC(18, 2) DEFAULT 0, -- USD Value
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    ccip_status TEXT NOT NULL DEFAULT 'PENDING',
    
    -- New Contract Columns
    contract_address TEXT, -- The main interaction contract (CreditManager/Vault)
    asset_address TEXT,    -- The ERC20 token address
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy (Public Read)
CREATE POLICY "Enable read access for all users" ON public.pools
    FOR SELECT USING (true);

-- 4. Seed Data
-- Using Hardhat Deployment Addresses for the Master Pool (simulating Avalanche Fuji)
-- CreditManager: 0x5FbDB2315678afecb367f032d93F642f64180aa3
-- PaymentToken: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

INSERT INTO public.pools (slug, chain_name, asset_symbol, pool_type, apy, tvl, status, ccip_status, contract_address, asset_address)
VALUES
    -- Master Pool (Mapped to Local Hardhat Deployment)
    ('avax-usdc', 'Avalanche Fuji', 'USDC', 'MASTER', 8.2, 5200000, 'ACTIVE', 'CORE', '0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'),
    
    -- Satellite Pools (Placeholders / Not yet deployed on local)
    ('pol-matic', 'Polygon Amoy', 'MATIC', 'SATELLITE', 12.4, 1800000, 'SYNCED', 'LINKED', NULL, NULL),
    ('eth-weth', 'Ethereum Sepolia', 'WETH', 'SATELLITE', 4.5, 12400000, 'SYNCED', 'LINKED', NULL, NULL),
    ('base-usdc', 'Base Sepolia', 'USDC', 'SATELLITE', 6.1, 3100000, 'BOOTSTRAP', 'PENDING', NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET
    chain_name = EXCLUDED.chain_name,
    asset_symbol = EXCLUDED.asset_symbol,
    apy = EXCLUDED.apy,
    tvl = EXCLUDED.tvl,
    status = EXCLUDED.status,
    ccip_status = EXCLUDED.ccip_status,
    contract_address = EXCLUDED.contract_address,
    asset_address = EXCLUDED.asset_address;
