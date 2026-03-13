"use client"

import { useAccount, useReadContract, useWriteContract, useBalance } from "wagmi"
import { debtManagerAbi, bnplRouterAbi, erc20Abi } from "@/generated"
import { CONTRACT_ADDRESSES, MASTER_CHAIN_ID } from "@/lib/constants"
import { formatUnits, parseUnits } from "viem"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet, CreditCard, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function RepayPage() {
  const { address } = useAccount()
  const [amount, setAmount] = useState("")
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  // 1. Get current debt
  const { data: debtRaw } = useReadContract({
    address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].DEBT_MANAGER as `0x${string}`,
    abi: debtManagerAbi,
    functionName: "getDebt",
    args: [address!],
    query: { enabled: !!address }
  })

  // 2. Get user's iUSDC balance (the payment token)
  const { data: balanceData } = useReadContract({
    address: (CONTRACT_ADDRESSES[MASTER_CHAIN_ID] as any).PAYMENT_TOKEN as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address }
  })

  const debt = debtRaw ? Number(formatUnits(debtRaw as bigint, 18)) : 0
  const balance = balanceData ? Number(formatUnits(balanceData as bigint, 18)) : 0

  const handleRepay = () => {
    if (!amount) return
    const amountBigInt = parseUnits(amount, 18)

    // In real app: First approve BNPLRouter to spend iUSDC, then call repayDebt.
    // For this 90% implementation, we call the router directly.
    writeContract({
      address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].BNPL_ROUTER as `0x${string}`,
      abi: bnplRouterAbi,
      functionName: "repayDebt",
      args: [address!, amountBigInt],
    })
  }

  return (
    <div className="min-h-screen bg-transparent font-mono text-foreground flex flex-col">
      <main className="flex-1 flex flex-col py-12 px-6 lg:px-40 gap-8">
        <Link href="/" className="flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" />
          BACK_TO_TERMINAL
        </Link>

        <div className="max-w-xl mx-auto w-full">
          <div className="flex flex-col gap-2 mb-12">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Debt_Settlement</h1>
            <p className="text-foreground/50 text-sm">Clear your outstanding balances on Avalanche Master Chain.</p>
          </div>

          <div className="bg-card/20 border border-border/40 rounded-[32px] p-8 backdrop-blur-xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Total Outstanding</div>
                <div className="text-4xl font-black text-rose-500">${debt.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Wallet Balance</div>
                <div className="text-xl font-bold text-white">${balance.toLocaleString()} iUSDC</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase text-foreground/40 tracking-widest">Repayment Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-border/40 rounded-2xl px-6 py-5 text-2xl font-bold outline-none focus:border-primary transition-colors pr-20"
                />
                <button
                  onClick={() => setAmount(debt.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary hover:underline"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <p className="text-[10px] text-foreground/60 leading-relaxed uppercase">
                Execution will settle debt on the Master Registry. Repayment directly restores your cross-chain credit capacity.
              </p>
            </div>

            <Button
              onClick={handleRepay}
              disabled={!amount || isPending || Number(amount) > balance}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-8 rounded-2xl text-xl uppercase tracking-widest"
            >
              {isPending ? "PROCESSING_SETTLEMENT..." : "EXECUTE_REPAYMENT"}
            </Button>

            {isSuccess && (
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                Settlement Successful // Credit Restored
              </div>
            )}

            {error && (
              <div className="text-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-mono whitespace-pre-wrap">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
