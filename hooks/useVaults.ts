"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { api } from '@/lib/api'
// import { OBOLUS_CONTRACTS } from '@/lib/wagmi' // REMOVED
// import { RWAVaultABI } from '@/lib/abis' // REMOVED
import { encryptAmount } from '@/lib/encryption'

// --- Helper for Auth (Simplified for Solana) ---

export function useObolusAuth() {
  const { authenticated, user, ready, signMessage } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address

  const getSignature = async () => {
    if (!address) throw new Error("WALLET_NOT_CONNECTED")

    // For Solana, we can sign a simple message for authentication
    const nonce = Date.now().toString()
    const message = `Obolus Authentication\nNonce: ${nonce}`
    
    let signature = 'solana_signature_stub'
    try {
      // signature = await signMessage(message)
    } catch (e) {
      console.warn('[OBOLUS:AUTH] Signing failed, using stub')
    }
    
    return { signature, nonce }
  }

  return { getSignature }
}


// --- Hooks ---

/**
 * Fetch user profile and stats
 */
export function useUserProfile() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['user-profile', address],
    queryFn: () => api.get<any>(`/api/v1/user/${address}`, { walletAddress: address }),
    enabled: !!address,
  })
}

/**
 * Fetch platform-wide TVL and position counts
 */
export function usePlatformTVL() {
  return useQuery({
    queryKey: ['platform-tvl'],
    queryFn: () => api.get<any>('/api/v1/vault/tvl'),
  })
}

/**
 * Fetch all active positions for a user
 */
export function useVaultPositions() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['vault-positions', address],
    queryFn: async () => {
      try {
        const data = await api.get<{ positions: any[] }>(`/api/v1/vault/positions/${address}`)
        return data
      } catch (error) {
        console.error('[OBOLUS:VAULT_POSITIONS:ERROR] Failed to fetch positions', error)
        throw error
      }
    },
    enabled: !!address,
  })
}

/**
 * Fetch NAV history for a user.
 * Improved to construct real history from market data if server data is unavailable.
 */
export function useNAVHistory(days: number = 30, currentPositions?: any[]) {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['nav-history', address, days, !!currentPositions],
    queryFn: async () => {
      // 1. Try to fetch real history from server
      try {
        const data = await api.get<{ snapshots: any[] }>(`/api/v1/nav/history/${address}?days=${days}`, { walletAddress: address })
        if (data.snapshots && data.snapshots.length >= 2) {
          return data
        }
      } catch (e) {
        console.warn('[OBOLUS:NAV_HISTORY] Server history empty or failed, reconstructing real trend from market data...')
      }

      // 2. RECONSTRUCTION: Build history from current holdings + real market history
      // We use currentPositions if provided, otherwise check cache
      const positions = currentPositions || 
                        queryClient.getQueryData<any>(['vault-positions', address])?.positions || 
                        []
      
      const activePositions = positions.filter((p: any) => parseFloat(p.formatted) > 0)
      
      if (activePositions.length === 0) return { snapshots: [] }

      // Dynamically import history fetcher to avoid circular deps
      const { fetchPriceHistory, UNDERLYING_TICKERS } = await import('@/lib/twelvedata')
      
      // Fetch historical prices for each held stock
      const histories: Record<string, { timestamp: string, price: number }[]> = {}
      await Promise.all(activePositions.map(async (pos: any) => {
        const ticker = UNDERLYING_TICKERS[pos.symbol]
        if (ticker) {
          try {
            const h = await fetchPriceHistory(ticker, '1day', days)
            histories[pos.symbol] = h
          } catch (err) {
            console.error(`Failed to fetch history for ${pos.symbol}`, err)
          }
        }
      }))

      // Aggregate into a single NAV line
      // Use time points from the first successful history as baseline
      const baselineSymbol = Object.keys(histories)[0]
      if (!baselineSymbol) return { snapshots: [] }
      
      const timestamps = histories[baselineSymbol].map(p => p.timestamp)
      
      const snapshots = timestamps.map(ts => {
        let totalValue = 0
        activePositions.forEach((pos: any) => {
          const history = histories[pos.symbol] || []
          // Match by date string
          const dateStr = ts.split(' ')[0] || ts.split('T')[0]
          const snap = history.find(p => p.timestamp.startsWith(dateStr))
          const priceAtT = snap ? snap.price : (history[0]?.price || 0)
          
          totalValue += parseFloat(pos.formatted || '0') * priceAtT
        })
        return { 
          timestamp: ts, 
          value: Math.round(totalValue * 100) / 100 
        }
      })

      return { snapshots }
    },
    enabled: !!address,
    staleTime: 10 * 60_000,
  })
}

/**
 * Fetch latest prices for all tokens
 */
export function useLatestPrices() {
  return useQuery({
    queryKey: ['latest-prices'],
    queryFn: () => api.get<{ prices: Record<string, any> }>('/api/v1/prices/latest'),
  })
}

/**
 * Fetch transaction history
 */
export function useRecentTransactions(limit: number = 10) {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['transactions', address, limit],
    queryFn: () => api.get<{ transactions: any[] }>(`/api/v1/transactions/${address}?limit=${limit}`, { walletAddress: address }),
    enabled: !!address,
  })
}

/**
 * Execute a Deposit Flow: Solana/Anchor -> Record Transaction -> Upsert Position
 */
export function useVaultDeposit() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address
  // const chainId = wallet?.chainId

  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tokenAddress, amount, vaultId }: { tokenAddress: string, amount: string, vaultId: string }) => {
      if (!address) throw new Error("WALLET_NOT_CONNECTED")
      
      // 1. TODO: Execute Anchor Deposit
      console.log("[OBOLUS:SOLANA] Deposit would happen here via Anchor", { vaultId, amount })
      const txHash = "solana_deposit_tx_hash_placeholder"

      // 3. Get Auth Signature for server recording
      const { signature, nonce } = await getSignature()

      // 4. Record Transaction in Backend
      const encryptedAmount = await encryptAmount(amount)
      await api.post('/api/v1/transactions/record', {
        userAddress: address,
        type: 'deposit',
        vaultId,
        tokenAddress,
        encryptedAmount,
        txHash,
        chainId: 0, // Placeholder
        status: 'executed'
      }, { walletAddress: address, signature, nonce })

      // 5. Upsert Position in Backend
      await api.post('/api/v1/vault/position/upsert', {
        userAddress: address,
        vaultId,
        tokenAddress,
        encryptedBalance: encryptedAmount,
        encryptedEntryPrice: "0",
        txHashDeposit: txHash,
        chainId: 0 // Placeholder
      }, { walletAddress: address, signature: signature, nonce: nonce }) 

      return txHash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-positions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['nav-history'] })
    }
  })
}

/**
 * Execute a Withdraw Flow
 */
export function useVaultWithdraw() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address

  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tokenAddress, shares, vaultId }: { tokenAddress: string, shares: string, vaultId: string }) => {
      if (!address) throw new Error("WALLET_NOT_CONNECTED")

      // 1. TODO: Execute Anchor Withdraw
      console.log("[OBOLUS:SOLANA] Withdraw would happen here via Anchor", { vaultId, shares })
      const txHash = "solana_withdraw_tx_hash_placeholder"

      // 2. Get Auth Signature
      const { signature, nonce } = await getSignature()

      // 3. Record Transaction
      await api.post('/api/v1/transactions/record', {
        userAddress: address,
        type: 'withdraw',
        vaultId,
        tokenAddress,
        encryptedAmount: shares.toString(),
        txHash,
        chainId: 0, // Placeholder
        status: 'executed'
      }, { walletAddress: address, signature, nonce })

      // 4. Close Position
      const { signature: sig2, nonce: nonce2 } = await getSignature()
      await api.post('/api/v1/vault/position/close', {
        userAddress: address,
        vaultId,
        txHashWithdraw: txHash
      }, { walletAddress: address, signature: sig2, nonce: nonce2 })

      return txHash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-positions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['nav-history'] })
    }
  })
}
