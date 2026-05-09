"use client"

import { useState, useEffect } from 'react'
import { Terminal, Globe, CheckCircle2, Copy, ExternalLink, RefreshCw, Smartphone, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePrivy, useWallets } from "@privy-io/react-auth"
// import { useAccount, useChainId, useSwitchChain } from 'wagmi' // REMOVED
import { useAllTokenBalances, useTokenBalance } from '@/hooks/useContracts'
import { useMintFaucet } from '@/hooks/useContractWrite'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import { cn } from '@/lib/utils'

// --- STUBS ---
const useAccount = () => {
  const { user, authenticated } = usePrivy()
  const { wallets } = useWallets()
  return { address: wallets[0]?.address || user?.wallet?.address, isConnected: authenticated }
}
const useChainId = () => 0
const useSwitchChain = () => ({ switchChain: () => {} })
// -------------


// Client-side only component to prevent hydration mismatch
export default function FaucetPage() {
  const { address } = useAccount()
  const { data: solBalance, refetch } = { data: '0', refetch: () => {} } // simplified for now
  const { mint, mintingSymbol, lastTxHash, error: mintError } = useMintFaucet()
  const [logs, setLogs] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    addLog('SYSTEM_BOOT // INITIALIZING_FAUCET_PROTOCOL')
  }, [])

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50))
  }

  const handleMint = async () => {
    if (!address) return addLog('ERROR: WALLET_NOT_CONNECTED')
    try {
      addLog(`INITIATING_AIRDROP // SOL // SOLANA_DEVNET`)
      const tx = await mint('SOL')
      addLog(`TX_CONFIRMED // HASH: ${tx}`)
      addLog(`AIRDROP_COMPLETE // VIEW_ON_EXPLORER: https://explorer.solana.com/tx/${tx}?cluster=devnet`)
    } catch (e: any) {
      addLog(`AIRDROP_FAILED // ${e.message}`)
    }
  }

  if (!isMounted) return null

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                FAUCET <span className="text-amber-500">//</span> SOLANA_DEVNET
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-border/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 text-xs">
                    NETWORK_SYNCED // DEVNET
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-foreground/60 font-medium max-w-xl leading-relaxed uppercase tracking-tight">
            Request SOL airdrops to interact with the Obolus Vault on Solana Devnet. 
            Each request dispenses 1 SOL to your connected wallet.
          </p>
        </div>

        <Button 
          onClick={handleMint}
          disabled={!!mintingSymbol}
          className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs h-12 px-8 rounded-2xl uppercase tracking-widest flex items-center gap-2"
        >
          {mintingSymbol ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {mintingSymbol ? `REQUESTING_SOL...` : 'Request 1 SOL Airdrop'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Token Card */}
        <div className="lg:col-span-8">
          <div className="bg-white/5 border border-border/20 rounded-[32px] p-8 backdrop-blur-sm group hover:border-amber-500/30 transition-all flex flex-col gap-6 relative overflow-hidden max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg font-black text-amber-500">
                SOL
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Solana (Devnet)</h3>
                <span className="text-[9px] text-foreground/40 font-mono">native_protocol_asset</span>
              </div>
            </div>
            <div className="bg-black/40 rounded-2xl p-5 border border-border/10">
              <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest block mb-1">WALLETS_BALANCE</span>
              <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                {address ? 'CONNECTED' : '---'}
              </span>
            </div>
            <Button 
              onClick={handleMint}
              disabled={!!mintingSymbol}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black text-xs h-12 rounded-2xl uppercase tracking-widest"
            >
              Claim SOL
            </Button>
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
              TERMINAL_FEEDBACK // STREAMS
            </h2>
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="bg-black/40 border border-border/40 rounded-[32px] p-6 backdrop-blur-sm h-[400px] flex flex-col font-mono">
            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] text-foreground/70 leading-relaxed break-all">
                  <span className="text-amber-500/60 font-bold mr-2">{">"}</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function TokenCard({ symbol, address, balance, onClaim, isMinting }: { 
  symbol: string, 
  address: string, 
  balance: string, 
  onClaim: () => void,
  isMinting: boolean 
}) {
  return (
    <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 backdrop-blur-sm group hover:border-amber-500/30 transition-all flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
        <Zap className="w-16 h-16 text-amber-500" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-border/20 flex items-center justify-center text-lg font-black text-foreground relative z-10 overflow-hidden bg-white/5">
             <img 
              src={symbol === 'oUSD' ? '/logo-only.png' : `/stocks/${symbol.replace(/x$|on$|X$/i, '')}.png`} 
              alt={symbol} 
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
             />
          </div>
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-amber-500/40" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{symbol}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-foreground/40 font-mono truncate max-w-[80px]">{address}</span>
            <a href={`https://testnet.bscscan.com/address/${address}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-2.5 h-2.5 text-foreground/20 hover:text-amber-500 transition-colors" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-2xl p-5 border border-border/10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">WALLETS_BALANCE</span>
          <div className="w-1 h-1 rounded-full bg-green-500/50" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
            {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-foreground/20 uppercase">{symbol}</span>
        </div>
      </div>

      <Button 
        onClick={onClaim}
        disabled={isMinting}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/20 text-black font-black text-xs h-12 rounded-2xl uppercase tracking-widest transition-all"
      >
        {isMinting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
        {isMinting ? 'MINTING_PROTOCOL...' : `Claim_1000_${symbol}`}
      </Button>
    </div>
  )
}
