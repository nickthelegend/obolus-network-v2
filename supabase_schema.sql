-- Create Agents Table
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  strategy text not null,
  wallet_address text unique not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Users Table (keyed by wallet address generally in web3 apps)
create table public.users (
  wallet_address text primary key,
  username text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Vaults Table
create table public.vaults (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  chain_id integer not null,
  address text unique not null,
  asset_address text not null,
  asset_symbol text,
  total_assets numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.agents enable row level security;
alter table public.users enable row level security;
alter table public.vaults enable row level security;

-- Create Policies (Open for now as starting point, but ideally restricted)
create policy "Public agents are viewable by everyone." on public.agents for select using (true);
create policy "Reviewable vaults" on public.vaults for select using (true);
create policy "Users can check their own data" on public.users for select using (auth.uid()::text = wallet_address); 
-- Note: auth.uid() usually returns UUID for Supabase Auth, but if using wallet as ID, adjust accordingly.
-- Migration: Create pools table and seed data
-- Description: Sets up the structure for Lending Pools and populates it with the initial mock data.

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy (Public Read)
CREATE POLICY "Enable read access for all users" ON public.pools
    FOR SELECT USING (true);

-- 4. Seed Data (Matching current mock data)
INSERT INTO public.pools (slug, chain_name, asset_symbol, pool_type, apy, tvl, status, ccip_status)
VALUES
    ('avax-usdc', 'Avalanche Fuji', 'USDC', 'MASTER', 8.2, 5200000, 'ACTIVE', 'CORE'),
    ('pol-matic', 'Polygon Amoy', 'MATIC', 'SATELLITE', 12.4, 1800000, 'SYNCED', 'LINKED'),
    ('eth-weth', 'Ethereum Sepolia', 'WETH', 'SATELLITE', 4.5, 12400000, 'SYNCED', 'LINKED'),
    ('base-usdc', 'Base Sepolia', 'USDC', 'SATELLITE', 6.1, 3100000, 'BOOTSTRAP', 'PENDING')
ON CONFLICT (slug) DO UPDATE SET
    chain_name = EXCLUDED.chain_name,
    asset_symbol = EXCLUDED.asset_symbol,
    apy = EXCLUDED.apy,
    tvl = EXCLUDED.tvl,
    status = EXCLUDED.status,
    ccip_status = EXCLUDED.ccip_status;
