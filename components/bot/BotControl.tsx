"use client"

import { useState, useTransition } from "react"
import { Play, Square, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BotStatusBadge } from "./BotStatusBadge"
import type { BotConfig } from "@/types"

interface BotControlProps {
  config: BotConfig
}

export function BotControl({ config: initial }: BotControlProps) {
  const [config, setConfig] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function toggleBot() {
    setError(null)
    startTransition(async () => {
      const action = config.isActive ? "stop" : "start"
      const res = await fetch("/api/bot/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al cambiar estado del bot")
        return
      }
      setConfig((prev) => ({ ...prev, isActive: !prev.isActive }))
    })
  }

  const isActive = config.isActive

  return (
    <div className="rounded-2xl bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Control del Bot</h2>
          <p className="text-xs text-slate-400 mt-0.5">{config.symbol} · {config.strategy}</p>
        </div>
        <BotStatusBadge isActive={isActive} mode={config.mode} />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <p className="text-slate-400 mb-0.5">Exchange</p>
          <p className="font-semibold text-slate-700 capitalize">{config.exchange}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <p className="text-slate-400 mb-0.5">Capital/trade</p>
          <p className="font-semibold text-slate-700">{config.capitalPercent}%</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <p className="text-slate-400 mb-0.5">Max DD</p>
          <p className="font-semibold text-slate-700">{config.maxDrawdown}%</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={toggleBot}
          disabled={isPending}
          className={`flex-1 gap-2 ${
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isActive ? (
            <><Square className="h-4 w-4 fill-current" /> Detener</>
          ) : (
            <><Play className="h-4 w-4 fill-current" /> Iniciar</>
          )}
        </Button>
        <Button variant="outline" size="icon" asChild>
          <a href="/bot/settings">
            <Settings className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
