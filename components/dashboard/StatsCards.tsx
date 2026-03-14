import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  balance: number
  totalIncome: number
  totalExpense: number
  transactionCount: number
}

export function StatsCards({ balance, totalIncome, totalExpense, transactionCount }: StatsCardsProps) {
  const isPositive = balance >= 0

  return (
    <div className="px-4 space-y-3">
      {/* Balance principal */}
      <div
        className={`rounded-3xl p-6 text-white ${
          isPositive
            ? "bg-gradient-to-br from-violet-600 to-violet-800"
            : "bg-gradient-to-br from-rose-500 to-rose-700"
        }`}
      >
        <p className="text-violet-200 text-sm font-medium mb-1">Balance total</p>
        <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
        <p className="text-violet-200 text-xs mt-2">{transactionCount} transacciones este mes</p>
      </div>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Ingresos</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-rose-500" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Gastos</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-rose-500 font-medium mt-0.5">Este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
