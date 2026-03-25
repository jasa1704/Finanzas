import { formatDateTime, formatPrice, formatPnl, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Últimos Trades</h3>

      {trades.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Sin operaciones aún</p>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => {
            const pnl = trade.pnl !== null ? parseFloat(trade.pnl.toString()) : null
            const pnlPct = trade.pnlPercent !== null ? parseFloat(trade.pnlPercent.toString()) : null
            const isWin = pnl !== null && pnl >= 0
            const isOpen = trade.status === "OPEN"

            return (
              <div key={trade.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                    trade.side === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {trade.side === "BUY" ? "B" : "S"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{trade.symbol}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(trade.openedAt)} · {trade.strategy ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {isOpen ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Abierto
                    </span>
                  ) : pnl !== null ? (
                    <>
                      <p className={cn("text-sm font-semibold tabular-nums", isWin ? "text-emerald-600" : "text-red-500")}>
                        {formatPnl(pnl)}
                      </p>
                      <p className={cn("text-xs", isWin ? "text-emerald-500" : "text-red-400")}>
                        {pnlPct !== null ? formatPercent(pnlPct) : ""}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
