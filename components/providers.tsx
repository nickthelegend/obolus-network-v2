"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from "@/components/ui/sonner"

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <PrivyProvider
      appId="cmnxrfag1001j0dl2xynzgd6n"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#9fd843',
          logo: "/logo.png",
          landingHeader: "OBOLUS // TERMINAL",
          loginMessage: "Connect to the Frontier",
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
          walletList: ["phantom", "solflare", "backpack", "detected_solana_wallets"],
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'apple', 'discord'],
        solanaClusters: [
          {
            name: 'devnet',
            rpcUrl: 'https://api.devnet.solana.com',
          },
        ],
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
