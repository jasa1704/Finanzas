import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Header } from "@/components/layout/Header"
import { formatDateTime, formatPrice, formatPnl, formatPercent, formatQuantity } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default async function TradesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const trades = await db.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { openedAt: "desc" },
    take: 50,
  })

  return (
    <div>
      <Header title="Trades" />
      <div className="pt-4 pb-6 px-4 space-y-3">
        {trades.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <p className="text-3xl mb-3">📊</p>
            <p>Sin operaciones aún.</p>
            <p className="text-xs mt-1">Inicia el bot desde la pestaña Bot.</p>
          </div>
        ) : (
          trades.map((trade) => {
            const pnl = trade.pnl !== null ? parseFloat(trade.pnl.toString()) : null
            const pnlPct = trade.pnlPercent !== null ? parseFloat(trade.pnlPercent.toString()) : null
            const isWin = pnl !== null && pnl >= 0
            const isOpen = trade.status === "OPEN"

            return (
              <div key={trade.id} className="rounded-2xl bg-white p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm",
                      trade.side === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {trade.side === "BUY" ? "B" : "S"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{trade.symbol}</p>
                      <p className="text-xs text-slate-400">{trade.strategy ?? "—"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isOpen ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Abierto
                      </span>
                    ) : pnl !== null ? (
                      <>
                        <p className={cn("text-sm font-bold tabular-nums", isWin ? "text-emerald-600" : "text-red-500")}>
                          {formatPnl(pnl)}
                        </p>
                        {pnlPct !== null && (
                          <p className={cn("text-xs", isWin ? "text-emerald-500" : "text-red-400")}>
                            {formatPercent(pnlPct)}
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Detail row */}
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Entry</p>
                    <p className="font-medium text-slate-700">{formatPrice(trade.entryPrice.toString())}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Exit</p>
                    <p className="font-medium text-slate-700">
                      {trade.exitPrice ? formatPrice(trade.exitPrice.toString()) : "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Qty</p>
                    <p className="font-medium text-slate-700">{formatQuantity(trade.quantity.toString())}</p>
                  </div>
                </div>

                {/* SL / TP */}
                {(trade.stopLoss || trade.takeProfit) && (
                  <div className="flex gap-2 text-xs">
                    {trade.stopLoss && (
                      <span className="flex-1 text-center bg-red-50 text-red-600 rounded-lg py-1">
                        SL {formatPrice(trade.stopLoss.toString())}
                      </span>
                    )}
                    {trade.takeProfit && (
                      <span className="flex-1 text-center bg-emerald-50 text-emerald-600 rounded-lg py-1">
                        TP {formatPrice(trade.takeProfit.toString())}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400">{formatDateTime(trade.openedAt)}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
