const { createPublicClient, http, formatUnits } = require('viem');
const { avalancheFuji, baseSepolia, sepolia, polygonAmoy } = require('viem/chains');

const CHAIN_MAP = {
    43113: { chain: avalancheFuji, rpc: "https://api.avax-test.network/ext/bc/C/rpc" },
    84532: { chain: baseSepolia, rpc: "https://sepolia.base.org" },
    11155111: { chain: sepolia, rpc: "https://ethereum-sepolia-rpc.publicnode.com" },
    80002: { chain: polygonAmoy, rpc: "https://rpc-amoy.polygon.technology" }
};

const ERC20_ABI = [
    { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
    { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }] }
];

const POOLS = [
    { name: "AVAX", chain: 43113, asset: '0x5425890298aed601595a70ab815c96711a31bc65', contract: '0x306613586DA080D9CCC41D469F2EEB282745A6aa' },
    { name: "BASE", chain: 84532, asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', contract: '0xCC87F6051Fab93D78355C17f42E62193D8Aa0Daa' },
    { name: "ETH", chain: 11155111, asset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', contract: '0x58e67dEEEcde20f10eD90B5191f08f39e81B6658' },
    { name: "POL", chain: 80002, asset: '0x0000000000000000000000000000000000001010', contract: '0x0000000000000000000000000000000000000000' }
];

async function check() {
    for (const p of POOLS) {
        if (p.contract === '0x0000000000000000000000000000000000000000') continue;
        try {
            const config = CHAIN_MAP[p.chain];
            const client = createPublicClient({ chain: config.chain, transport: http(config.rpc) });
            const [balance, decimals] = await Promise.all([
                client.readContract({ address: p.asset, abi: ERC20_ABI, functionName: 'balanceOf', args: [p.contract] }),
                client.readContract({ address: p.asset, abi: ERC20_ABI, functionName: 'decimals' })
            ]);
            console.log(`${p.name}: ${formatUnits(balance, decimals)}`);
        } catch (e) {
            console.log(`${p.name}: ERROR ${e.message}`);
        }
    }
}

check();
