
# Irion Roadmap

## Phase 1: Database Migration & Schema Design
**Goal**: Establish the database foundation and replace hardcoded mock data with persistent storage.
- Design `pools` table schema.
- Create migration SQL file.
- Seed database with initial data (replicating current mock data).

## Phase 2: API & Backend Integration
**Goal**: Create API endpoints to serve pool data to the frontend.
- Implement Next.js API route `/api/pools`.
- Connect API to Supabase.
- (Optional) Implement basic sync logic or admin endpoint to update values.

## Phase 3: Frontend Data Binding
**Goal**: Connect the UI to the real data source.
- Update `pools/page.tsx` to fetch data from `/api/pools`.
- Remove hardcoded `MULTI_CHAIN_POOLS` constant.
- Handle loading and error states.
