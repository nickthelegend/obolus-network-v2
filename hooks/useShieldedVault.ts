import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useQueryClient } from '@tanstack/react-query';
import { useAnchorProvider } from './use-anchor-provider';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { encryptAmount } from '@/lib/encryption';
import { api } from '@/lib/api';

export type ShieldStep =
  | 'idle'
  | 'signing'
  | 'encrypting'
  | 'shielding'
  | 'complete'
  | 'error';

export type WithdrawStep =
  | 'idle'
  | 'signing'
  | 'queued'
  | 'executing'
  | 'complete'
  | 'error';

export function useShieldedDeposit() {
  const { signMessage, user } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address || user?.wallet?.address;
  const provider = useAnchorProvider();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<ShieldStep>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const deposit = useCallback(async ({
    tokenSymbol,
    tokenAddress,
    amount,
  }: {
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
  }) => {
    if (!address || !provider) throw new Error('Wallet not connected');
    setError('');
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      // Step 1: Sign Solana Message to authorize shielding
      setStep('signing');
      const message = `OBOLUS_SHIELDED_DEPOSIT:${address}:${amount}:${timestamp}`;
      const signature = await signMessage(message);

      // Step 2: Encrypt amount for CRE
      setStep('encrypting');
      const encryptedAmt = await encryptAmount(amount);

      // Step 3: Call Solana Vault Program
      setStep('shielding');
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), new PublicKey(address).toBuffer()],
        provider.programId
      );

      const amountInLamports = new anchor.BN(parseFloat(amount) * 1e9);
      const depositTx = await provider.program.methods
        .deposit(amountInLamports)
        .accounts({
          vault: vaultPDA,
          signer: new PublicKey(address),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setTxHash(depositTx);

      // Step 4: Record Shielded Position on Backend
      await api.post('/vault/shield', {
        account: address,
        token: tokenAddress,
        amount: amountInLamports.toString(),
        encryptedAmount: encryptedAmt,
        depositTxHash: depositTx,
        vaultId: tokenSymbol.toLowerCase(),
        timestamp,
        auth: signature,
      });

      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['solana-balance'] });
      queryClient.invalidateQueries({ queryKey: ['vault-position'] });

      return { depositTxHash: depositTx };
    } catch (e: any) {
      console.error('[OBOLUS:SHIELD_DEPOSIT:ERROR]', e.message);
      setError(e.message || 'Shielded deposit failed');
      setStep('error');
      throw e;
    }
  }, [address, provider, signMessage, queryClient]);

  const reset = useCallback(() => {
    setStep('idle');
    setTxHash('');
    setError('');
  }, []);

  return { deposit, step, txHash, error, reset };
}

export function useShieldedWithdraw() {
  const { signMessage, user } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address || user?.wallet?.address;
  const provider = useAnchorProvider();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WithdrawStep>('idle');
  const [transferId, setTransferId] = useState('');
  const [error, setError] = useState('');

  const withdraw = useCallback(async ({
    tokenSymbol,
    tokenAddress,
    shares,
  }: {
    tokenSymbol: string;
    tokenAddress: string;
    shares: string;
  }) => {
    if (!address || !provider) throw new Error('Wallet not connected');
    setError('');
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      // Step 1: Sign Solana Message to authorize withdrawal
      setStep('signing');
      const message = `OBOLUS_SHIELDED_WITHDRAW:${address}:${shares}:${timestamp}`;
      const signature = await signMessage(message);

      // Step 2: Queue withdrawal on Backend
      setStep('queued');
      const result = await api.post<{ transferId: string }>('/vault/unshield', {
        account: address,
        token: tokenAddress,
        shares: shares,
        vaultId: tokenSymbol.toLowerCase(),
        timestamp,
        auth: signature,
      });
      setTransferId(result.transferId);

      // Step 3: Simulated backend execution
      setStep('executing');
      await new Promise(r => setTimeout(r, 2000));
      
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['solana-balance'] });
      queryClient.invalidateQueries({ queryKey: ['vault-position'] });

      return { transferId: result.transferId };
    } catch (e: any) {
      console.error('[OBOLUS:SHIELD_WITHDRAW:ERROR]', e.message);
      setError(e.message || 'Shielded withdrawal failed');
      setStep('error');
      throw e;
    }
  }, [address, provider, signMessage, queryClient]);

  const reset = useCallback(() => {
    setStep('idle');
    setTransferId('');
    setError('');
  }, []);

  return { withdraw, step, transferId, error, reset };
}
