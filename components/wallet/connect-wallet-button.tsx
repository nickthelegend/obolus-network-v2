"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { Button } from "@/components/ui/button"

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Button
      onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-mono"
    >
      {isConnected && address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  )
}
