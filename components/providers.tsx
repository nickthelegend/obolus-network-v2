"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { config, monadTestnet } from '@/lib/wagmi'
import { ThemeProvider } from './theme-provider'
import { avalancheFuji, polygonAmoy } from 'wagmi/chains'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm79o2k0r01y712q9e9v2q2y4"} // Fallback to a test ID if env is missing
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#9fd843',
        },
        supportedChains: [monadTestnet, avalancheFuji, polygonAmoy],
        loginMethods: ['wallet', 'email', 'google'],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
