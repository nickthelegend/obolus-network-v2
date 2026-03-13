import { http, createConfig } from 'wagmi'
import { avalancheFuji, polygonAmoy } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [avalancheFuji, polygonAmoy],
  connectors: [
    injected(),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '' }),
  ],
  ssr: true,
  transports: {
    [avalancheFuji.id]: http(),
    [polygonAmoy.id]: http(),
  },
})
