"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
import { cn, formatPrice, formatPercent } from "@/lib/utils"
import type { PriceUpdate } from "@/types"

export function PriceCard() {
  const [data, setData] = useState<PriceUpdate | null>(null)
  const [connected, setConnected] = useState(false)
  const [prevPrice, setPrevPrice] = useState<number | null>(null)

  useEffect(() => {
    const es = new EventSource("/api/bot/price")

    es.addEventListener("tick", (e) => {
      const tick: PriceUpdate = JSON.parse(e.data)
      setData((prev) => {
        if (prev) setPrevPrice(prev.price)
        return tick
      })
      setConnected(true)
    })

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  const isUp = data && data.changePercent24h >= 0
  const priceWentUp = prevPrice !== null && data !== null && data.price > prevPrice

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">₿</span>
          </div>
          <span className="text-sm font-medium text-slate-300">BTC / USDT</span>
        </div>
        <div className={cn("flex items-center gap-1 text-xs", connected ? "text-emerald-400" : "text-slate-500")}>
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span>{connected ? "Live" : "Offline"}</span>
        </div>
      </div>

      {data ? (
        <>
          <div className={cn(
            "text-3xl font-bold tabular-nums transition-colors duration-300",
            prevPrice !== null && (priceWentUp ? "text-emerald-400" : "text-red-400")
          )}>
            {formatPrice(data.price)}
          </div>

          <div className={cn(
            "flex items-center gap-1.5 mt-1 text-sm font-medium",
            isUp ? "text-emerald-400" : "text-red-400"
          )}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{formatPercent(data.changePercent24h)} 24h</span>
            <span className="text-slate-400 font-normal ml-1">
              H: {formatPrice(data.high24h)} · L: {formatPrice(data.low24h)}
            </span>
          </div>
        </>
      ) : (
        <div className="h-10 w-48 animate-pulse bg-slate-700 rounded-lg mt-1" />
      )}
    </div>
  )
}
