"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle, Clock, ArrowRight, ShieldCheck, Activity } from "lucide-react"

interface CCIPMessage {
    id: string;
    sourceChain: string;
    destChain: string;
    msgType: "CREDIT_UPDATE" | "WITHDRAW_REQUEST" | "LIQUIDATE";
    status: "SENDING" | "RELAYING" | "COMMITTED" | "SUCCESS";
    payload: string;
    timestamp: string;
}

export default function CCIPVisualizer() {
    const [messages, setMessages] = useState<CCIPMessage[]>([
        { 
            id: "0x42...a1f", 
            sourceChain: "Polygon Amoy", 
            destChain: "Avalanche Fuji", 
            msgType: "CREDIT_UPDATE", 
            status: "SUCCESS", 
            payload: "Credit +$250.00", 
            timestamp: "2M AGO" 
        },
        { 
            id: "0xb3...e44", 
            sourceChain: "Base Sepolia", 
            destChain: "Avalanche Fuji", 
            msgType: "CREDIT_UPDATE", 
            status: "SUCCESS", 
            payload: "Credit +$8,500.00", 
            timestamp: "1H AGO" 
        }
    ]);

    const [isSyncing, setIsSyncing] = useState(false);

    const triggerSync = () => {
        setIsSyncing(true);
        const newMessage: CCIPMessage = {
            id: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 5)}`,
            sourceChain: "Ethereum Sepolia",
            destChain: "Avalanche Fuji",
            msgType: "CREDIT_UPDATE",
            status: "SENDING",
            payload: "Syncing latest balances...",
            timestamp: "JUST NOW"
        };
        
        setMessages(prev => [newMessage, ...prev]);

        // Simulate CCIP Lifecycle
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "RELAYING" } : m));
        }, 2000);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "COMMITTED" } : m));
        }, 5000);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "SUCCESS", payload: "Credit +$1,200.00" } : m));
            setIsSyncing(false);
        }, 8000);
    };

    return (
        <div className="bg-card/20 border border-border/40 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">CCIP Message Relay</h3>
                </div>
                <button 
                    onClick={triggerSync}
                    disabled={isSyncing}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isSyncing ? 'border-primary/20 text-primary/40' : 'border-primary text-primary hover:bg-primary/10'}`}
                >
                    {isSyncing ? "Syncing_Protocol_State..." : "Manual_Sync"}
                </button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-5 rounded-2xl bg-background/40 border border-border/20 flex flex-col gap-3 group hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-foreground/80">{msg.sourceChain}</span>
                                    <ArrowRight className="w-3 h-3 text-foreground/30" />
                                    <span className="text-[10px] font-bold text-primary">{msg.destChain}</span>
                                </div>
                                <div className={`text-[9px] font-black uppercase tracking-tighter ${
                                    msg.status === 'SUCCESS' ? 'text-emerald-500' : 'text-primary animate-pulse'
                                }`}>
                                    {msg.status}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-mono font-bold text-foreground/40">{msg.id}</div>
                                    <div className="text-[11px] font-bold">{msg.payload}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-bold text-foreground/20 mb-1">{msg.msgType}</div>
                                    <div className="text-[10px] text-foreground/30">{msg.timestamp}</div>
                                </div>
                            </div>

                            {/* Progress bar for non-success */}
                            {msg.status !== 'SUCCESS' && (
                                <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden mt-2">
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={{ width: msg.status === 'SENDING' ? '30%' : msg.status === 'RELAYING' ? '60%' : '90%' }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
