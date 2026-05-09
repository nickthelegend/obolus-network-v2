'use client'

import React, { Suspense } from "react"
import dynamic from 'next/dynamic'
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Dynamic imports to prevent SSR localStorage issues
const AppHeader = dynamic(() => import("@/components/header").then(m => ({ default: m.AppHeader })), { ssr: false })
const AppFooter = dynamic(() => import("@/components/footer").then(m => ({ default: m.AppFooter })), { ssr: false })
const Providers = dynamic(() => import("@/components/providers").then(m => ({ default: m.Providers })), { ssr: false })
const WalletConnectHandler = dynamic(() => import("@/components/WalletConnectHandler").then(m => ({ default: m.WalletConnectHandler })), { ssr: false })
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <title>Obolus — Private Equity Vault on Solana</title>
        <meta name="description" content="Deposit tokenized US stocks on Solana with encrypted positions. Nobody sees what you hold." />
      </head>
      <body className={`font-mono ${GeistSans.variable} ${GeistMono.variable} antialiased min-h-dvh bg-background`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>
            <WalletConnectHandler />
            <div className="mx-auto w-full flex flex-col min-h-screen px-4 md:px-8 lg:px-12">
              <AppHeader />
              <main className="pb-24 flex-grow">{children}</main>
              <AppFooter />
            </div>
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}


