import { http, createConfig } from 'wagmi'
import { avalancheFuji, polygonAmoy } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [monadTestnet, avalancheFuji, polygonAmoy],
  connectors: [
    injected(),
  ],
  ssr: true,
  transports: {
    [monadTestnet.id]: http(),
    [avalancheFuji.id]: http(),
    [polygonAmoy.id]: http(),
  },
})
