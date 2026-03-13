"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"

export function ConnectWalletButton() {
  const { login, logout, authenticated, user, connectWallet, ready } = usePrivy()
  const address = user?.wallet?.address

  if (!ready) return null

  const handleClick = () => {
    console.log("ConnectWalletButton: handleClick triggered", { authenticated, wallet: user?.wallet })
    if (!authenticated) {
      console.log("ConnectWalletButton: calling login()")
      login()
    } else if (!user?.wallet) {
      console.log("ConnectWalletButton: calling connectWallet()")
      connectWallet()
    } else {
      console.log("ConnectWalletButton: calling logout()")
      logout()
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-mono relative z-50"
    >
      {authenticated && address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  )
}
