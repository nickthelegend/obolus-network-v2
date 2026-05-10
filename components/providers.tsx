"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from "@/components/ui/sonner"

import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

const solanaRpcs = {
  'solana:devnet': {
    rpc: createSolanaRpc('https://api.devnet.solana.com'),
    rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
    blockExplorerUrl: 'https://explorer.solana.com',
  },
} as const;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmoycfy9d03c10cl59t5gydne"}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#9fd843',
          logo: "/logo.png",
          landingHeader: "OBOLUS // TERMINAL",
          loginMessage: "Connect to the Frontier",
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'apple', 'discord'],
        solana: {
          rpcs: solanaRpcs,
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: false,
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
