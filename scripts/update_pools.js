const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Supabase credentials
const supabaseUrl = 'https://qswiggdjiobuasbpocts.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzd2lnZ2RqaW9idWFzYnBvY3RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzOTc4MCwiZXhwIjoyMDg2OTE1NzgwfQ.GUcHboWPtGMtvhlrJ_QK7_TD0fVzC8O3qRqoQeTH5TQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RPC_URLS = {
    avalancheFuji: "https://api.avax-test.network/ext/bc/C/rpc",
    baseSepolia: "https://sepolia.base.org",
    ethereumSepolia: "https://ethereum-sepolia-rpc.publicnode.com",
    polygonAmoy: "https://rpc-amoy.polygon.technology"
};

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

async function getBalance(network, assetAddr, contractAddr) {
    if (!assetAddr || !contractAddr || contractAddr === ethers.ZeroAddress) return 0;
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URLS[network]);
        const contract = new ethers.Contract(assetAddr, ERC20_ABI, provider);
        const [balance, decimals] = await Promise.all([
            contract.balanceOf(contractAddr),
            contract.decimals()
        ]);
        return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (e) {
        console.warn(`Could not fetch balance for ${network}:`, e.message);
        return 0;
    }
}

async function updatePools() {
    const deploymentsPath = path.join(__dirname, '..', '..', 'irion-smart-contracts', 'deployments.json');
    if (!fs.existsSync(deploymentsPath)) return;
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

    const pools = [
        {
            slug: 'avax-usdc',
            network: 'avalancheFuji',
            chainId: 43113,
            contract: deployments.avalancheFuji?.BNPLRouter,
            asset: '0x5425890298aed601595a70ab815c96711a31bc65',
            apy: 12.5 // Real-ish APY for testnet
        },
        {
            slug: 'base-usdc',
            network: 'baseSepolia',
            chainId: 84532,
            contract: deployments.baseSepolia?.CollateralVault,
            asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            apy: 18.2
        },
        {
            slug: 'eth-weth',
            network: 'ethereumSepolia',
            chainId: 11155111,
            contract: deployments.ethereumSepolia?.CollateralVault,
            asset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            apy: 9.4
        },
        {
            slug: 'pol-matic',
            network: 'polygonAmoy',
            chainId: 80002,
            contract: deployments.polygonAmoy?.CollateralVault,
            asset: '0x0000000000000000000000000000000000001010',
            apy: 14.1
        }
    ];

    for (const p of pools) {
        console.log(`Syncing ${p.slug} on ${p.network} (${p.chainId})...`);
        const realTvl = await getBalance(p.network, p.asset, p.contract);

        const { error } = await supabase
            .from('pools')
            .update({
                chain_id: p.chainId,
                contract_address: p.contract,
                asset_address: p.asset,
                tvl: realTvl,
                apy: p.apy
            })
            .eq('slug', p.slug);

        if (error) console.error(`Error ${p.slug}:`, error);
        else console.log(`Updated ${p.slug}: TVL=$${realTvl}`);
    }
}

updatePools().catch(console.error);
