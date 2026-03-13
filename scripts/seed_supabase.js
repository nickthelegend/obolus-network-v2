const { createClient } = require('@supabase/supabase-js');

// Load from provided keys
const supabaseUrl = 'https://qswiggdjiobuasbpocts.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzd2lnZ2RqaW9idWFzYnBvY3RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzOTc4MCwiZXhwIjoyMDg2OTE1NzgwfQ.GUcHboWPtGMtvhlrJ_QK7_TD0fVzC8O3qRqoQeTH5TQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const AGENTS = [
    {
        name: "Irion Master Agent",
        bio: "Core protocol agent managing the master lending registry on Avalanche.",
        strategy: "Aggregated Credit Management",
        wallet_address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Mock/Deployer
        image_url: "https://dicebear.com/api/avataaars/irion.svg"
    }
];

const VAULTS = [
    {
        chain_id: 43113,
        address: "0xcced...fd3b",
        asset_address: "0x0000000000000000000000000000000000000000",
        asset_symbol: "AVAX",
        total_assets: 5200000
    },
    {
        chain_id: 80002,
        address: "0x80002",
        asset_address: "0x...",
        asset_symbol: "POL",
        total_assets: 1800000
    },
    {
        chain_id: 11155111,
        address: "0x11155111",
        asset_address: "0x...",
        asset_symbol: "ETH",
        total_assets: 12400000
    },
    {
        chain_id: 84532,
        address: "0x84532",
        asset_address: "0x...",
        asset_symbol: "USDC",
        total_assets: 3100000
    }
];

async function seed() {
    console.log("Seeding Agents...");
    const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .upsert(AGENTS, { onConflict: 'wallet_address' })
        .select();

    if (agentError) {
        console.error("Error seeding agents:", agentError);
        return;
    }
    console.log("Agents seeded:", agentData.length);

    const agentId = agentData[0].id;

    console.log("Seeding Vaults...");
    const vaultsWithAgent = VAULTS.map(v => ({
        ...v,
        agent_id: agentId
    }));

    // Optional: Clear existing vaults for this agent
    await supabase.from('vaults').delete().eq('agent_id', agentId);

    const { data: vaultData, error: vaultError } = await supabase
        .from('vaults')
        .insert(vaultsWithAgent);

    if (vaultError) {
        console.error("Error seeding vaults:", vaultError);
        return;
    }
    console.log("Vaults seeded successfully.");
}

seed();
