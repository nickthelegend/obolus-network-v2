"use client"

import { useMemo } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider } from '@coral-xyz/anchor'
import { useWallets } from '@privy-io/react-auth/solana'

export function useAnchorProvider() {
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const connection = useMemo(() => new Connection('https://api.devnet.solana.com', 'confirmed'), [])

  return useMemo(() => {
    if (!wallet) return null

    const anchorWallet = {
      publicKey: new PublicKey(wallet.address),
      signTransaction: async (tx: any) => {
        return await wallet.signTransaction(tx)
      },
      signAllTransactions: async (txs: any[]) => {
        const signed = []
        for (const tx of txs) {
          signed.push(await wallet.signTransaction(tx))
        }
        return signed
      },
    }

    return new AnchorProvider(connection, anchorWallet as any, {
      preflightCommitment: 'confirmed',
    })
  }, [wallet, connection])
}
