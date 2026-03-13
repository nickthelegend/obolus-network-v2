---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Database Migration & Seeding

## Objective
Establish the database schema for the Lending Pools to replace the hardcoded mock data. This involves creating the SQL migration file and preparing the database for the application to consume real data.

## Context
- `app/pools/page.tsx`: Contains the current mock data structure (`MULTI_CHAIN_POOLS`).
- `supabase_schema.sql`: Existing schema file (will be appended to or referenced).
- `migrations/001_create_pools.sql`: The new migration file to be applied.

## Tasks

<task type="auto">
  <name>Create Migration File</name>
  <files>migrations/001_create_pools.sql</files>
  <action>
    Create a SQL file that:
    1. Defines the `pools` table with columns matching the frontend requirements (`slug`, `chain_name`, `apy`, `tvl`, etc.).
    2. Adds RLS policies to allow public read access.
    3. Inserts the initial seed data (the 4 pools currently hardcoded).
  </action>
  <verify>
    Check if the file exists and contains the CREATE TABLE and INSERT statements.
    (This step is effectively done as the file was created during the planning phase setup, but good to verify content).
  </verify>
  <done>File `migrations/001_create_pools.sql` exists and is valid SQL.</done>
</task>

<task type="auto">
  <name>Apply Migration to Supabase via Schema File</name>
  <files>supabase_schema.sql</files>
  <action>
    Append the content of `migrations/001_create_pools.sql` to `supabase_schema.sql` so that the user has a single source of truth for the schema if they execute it manually or via a script. 
    *Note: In a full production env we'd use `supabase db push`, but appending to the tracked schema file ensures visibility.*
  </action>
  <verify>
    Read `supabase_schema.sql` and confirm the `pools` table definition is present.
  </verify>
  <done>`supabase_schema.sql` includes the pools table definition.</done>
</task>

## Success Criteria
- [ ] `migrations/001_create_pools.sql` is created with correct schema and seed data.
- [ ] `supabase_schema.sql` is updated to include the new table.
- [ ] The schema accurately reflects the data needs of the Pools page.
