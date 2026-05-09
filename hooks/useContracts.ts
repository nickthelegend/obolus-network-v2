import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useQuery } from '@tanstack/react-query'
import { useAnchorProvider } from './use-anchor-provider'
import { PublicKey } from '@solana/web3.js'

export function useSolanaBalance(targetAddress?: string) {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const walletAddress = wallets[0]?.address || user?.wallet?.address
  const provider = useAnchorProvider()
  
  const addressToQuery = targetAddress || walletAddress

  return useQuery({
    queryKey: ['solana-balance', addressToQuery],
    queryFn: async () => {
      if (!provider || !addressToQuery) return '0'
      const balance = await provider.connection.getBalance(new PublicKey(addressToQuery))
      return (balance / 1e9).toFixed(4)
    },
    enabled: !!provider && !!addressToQuery,
  })
}

export function useVaultPosition() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const provider = useAnchorProvider()

  return useQuery({
    queryKey: ['vault-position', address],
    queryFn: async () => {
      if (!provider || !address) return { formatted: '0', raw: 0 }
      
      // Derive PDA: [b"vault", signer.key()]
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), new PublicKey(address).toBuffer()],
        provider.programId
      )

      const balance = await provider.connection.getBalance(vaultPDA)
      return {
        formatted: (balance / 1e9).toFixed(4),
        raw: balance,
        hasPosition: balance > 0
      }
    },
    enabled: !!provider && !!address,
  })
}

// Stubs for compatibility with existing UI components
export function useAllVaultPositions() {
  const { data } = useVaultPosition()
  return { 
    positions: { SOL: data || { formatted: '0', raw: 0, hasPosition: false } },
    isLoading: false 
  }
}

export function useTokenBalance(tokenAddress: string) {
  return useSolanaBalance()
}

export function useOracleSValue() {
  return { sValue: 1.0, paused: false, isLoading: false }
}

export function useVaultShares(vaultAddress?: string) {
  return { data: BigInt(0), isLoading: false, refetch: () => {} }
}

export function useTokenAllowance(tokenAddress: string, spenderAddress: string) {
  return { data: BigInt(1000000000000000000000n), isLoading: false, refetch: () => {} }
}

