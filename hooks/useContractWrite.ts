import { useState } from 'react'
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { encryptAmount } from '@/lib/encryption'
import { useAnchorProvider } from './use-anchor-provider'
import { Program, BN } from '@coral-xyz/anchor'
import { PROGRAM_ID, IDL } from '@/lib/solana/program'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { CONTRACT_ADDRESSES } from '@/lib/solana/addresses' // Still needed for faucet list if not migrated

// --- STUBS ---
// (Removed EVM stubs)
// -------------

export type TxStep =
  | 'idle'
  | 'preparing'
  | 'signing'
  | 'depositing'
  | 'withdrawing'
  | 'confirmed'
  | 'recording'
  | 'complete'
  | 'error'

export function useDepositFlow() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const queryClient = useQueryClient()
  const provider = useAnchorProvider()
  
  const [step, setStep] = useState<TxStep>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const deposit = async ({
    tokenSymbol,
    amount,
  }: {
    tokenSymbol: string
    amount: string
  }) => {
    if (!provider || !address) throw new Error("SOLANA_PROVIDER_NOT_READY")
    setError('')
    
    try {
      setStep('preparing')
      const program = new Program(IDL as any, provider)
      const lamports = new BN(parseFloat(amount) * 1e9) // SOL to lamports

      setStep('depositing')
      console.log('[OBOLUS:SOLANA] Depositing', amount, 'SOL to vault PDA')
      
      const tx = await program.methods
        .deposit(lamports)
        .rpc()

      setTxHash(tx)
      console.log('[OBOLUS:SOLANA] Deposit tx confirmed:', tx)

      setStep('recording')
      // Encrypt for CRE (stubbed for now)
      let encryptedAmt = await encryptAmount(amount)

      await api.post('/transactions/record', {
        userAddress: address,
        type: 'deposit',
        vaultId: tokenSymbol.toLowerCase(),
        encryptedAmount: encryptedAmt,
        txHash: tx,
        chainId: 0, // Solana
        status: 'executed',
      });

      setStep('complete')
      queryClient.invalidateQueries({ queryKey: ['solana-balance'] })
      return { depositTxHash: tx }

    } catch (e: any) {
      console.error('[OBOLUS:SOLANA:ERROR]', e)
      setError(e.message || 'Solana transaction failed')
      setStep('error')
      throw e
    }
  }

  const reset = () => {
    setStep('idle')
    setTxHash('')
    setError('')
  }

  return { deposit, step, txHash, error, reset }
}

export function useWithdrawFlow() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const queryClient = useQueryClient()
  const provider = useAnchorProvider()
  
  const [step, setStep] = useState<TxStep>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const withdraw = async ({
    tokenSymbol,
  }: {
    tokenSymbol: string
  }) => {
    if (!provider || !address) throw new Error("SOLANA_PROVIDER_NOT_READY")
    setError('')

    try {
      setStep('withdrawing')
      const program = new Program(IDL as any, provider)

      console.log('[OBOLUS:SOLANA] Withdrawing all from vault PDA')
      const tx = await program.methods
        .withdraw()
        .rpc()

      setTxHash(tx)
      console.log('[OBOLUS:SOLANA] Withdraw tx confirmed:', tx)

      setStep('recording')
      await api.post('/transactions/record', {
        userAddress: address,
        type: 'withdraw',
        vaultId: tokenSymbol.toLowerCase(),
        txHash: tx,
        chainId: 0,
        status: 'executed',
      });

      setStep('complete')
      queryClient.invalidateQueries({ queryKey: ['solana-balance'] })
      return tx

    } catch (e: any) {
      console.error('[OBOLUS:SOLANA:ERROR]', e)
      setError(e.message || 'Solana withdraw failed')
      setStep('error')
      throw e
    }
  }

  const reset = () => {
    setStep('idle')
    setTxHash('')
    setError('')
  }

  return { withdraw, step, txHash, error, reset }
}


export function useMintFaucet() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const queryClient = useQueryClient()
  const provider = useAnchorProvider()
  
  const [mintingSymbol, setMintingSymbol] = useState<string>('')
  const [lastTxHash, setLastTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const mint = async (tokenSymbol: string) => {
    if (!provider || !address) throw new Error("SOLANA_PROVIDER_NOT_READY")
    setError('')
    setMintingSymbol(tokenSymbol)

    try {
      console.log('[OBOLUS:FAUCET] Requesting SOL airdrop to', address)
      const tx = await provider.connection.requestAirdrop(
        new PublicKey(address),
        1 * 1e9 // 1 SOL
      )
      
      const latestBlockhash = await provider.connection.getLatestBlockhash()
      await provider.connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash
      })

      setLastTxHash(tx)
      console.log('[OBOLUS:FAUCET] Airdrop confirmed:', tx)

      queryClient.invalidateQueries({ queryKey: ['solana-balance'] })
      return tx
    } catch (e: any) {
      console.error('[OBOLUS:FAUCET:ERROR]', e)
      setError(e.message)
      throw e
    } finally {
      setMintingSymbol('')
    }
  }

  const mintAll = async () => {
    await mint('SOL')
  }

  return { mint, mintAll, mintingSymbol, lastTxHash, error }
}

