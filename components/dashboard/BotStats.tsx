import { TrendingUp, TrendingDown, BarChart2, Activity, Layers } from "lucide-react"
import { cn, formatPnl, formatPercent } from "@/lib/utils"
import type { DashboardStats } from "@/types"

interface BotStatsProps {
  stats: Pick<DashboardStats, "totalPnl" | "todayPnl" | "winRate" | "totalTrades" | "openPositions">
}

export function BotStats({ stats }: BotStatsProps) {
  const { totalPnl, todayPnl, winRate, totalTrades, openPositions } = stats

  const cards = [
    {
      label: "PnL Total",
      value: formatPnl(totalPnl),
      icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
      color: totalPnl >= 0 ? "text-emerald-600" : "text-red-500",
      bg: totalPnl >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      label: "PnL Hoy",
      value: formatPnl(todayPnl),
      icon: todayPnl >= 0 ? TrendingUp : TrendingDown,
      color: todayPnl >= 0 ? "text-emerald-600" : "text-red-500",
      bg: todayPnl >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      label: "Win Rate",
      value: formatPercent(winRate, 1),
      icon: BarChart2,
      color: winRate >= 50 ? "text-violet-600" : "text-slate-500",
      bg: "bg-violet-50",
    },
    {
      label: "Trades",
      value: totalTrades.toString(),
      icon: Activity,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      label: "Posiciones",
      value: openPositions.toString(),
      icon: Layers,
      color: openPositions > 0 ? "text-amber-600" : "text-slate-500",
      bg: openPositions > 0 ? "bg-amber-50" : "bg-slate-100",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={cn("rounded-2xl p-3.5", card.bg)}>
          <div className="flex items-center gap-2 mb-1.5">
            <card.icon className={cn("h-4 w-4", card.color)} />
            <span className="text-xs text-slate-500 font-medium">{card.label}</span>
          </div>
          <p className={cn("text-xl font-bold tabular-nums", card.color)}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
