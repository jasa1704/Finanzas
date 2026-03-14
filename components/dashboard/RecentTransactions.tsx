import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { type Transaction } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="mx-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Últimos movimientos</CardTitle>
        <Link href="/transactions" className="text-xs text-violet-600 font-medium flex items-center gap-0.5">
          Ver todos <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No hay transacciones aún. ¡Registra tu primer movimiento!
          </p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: t.category.color }}
              >
                {t.category.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {t.description || t.category.name}
                </p>
                <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    t.type === "INCOME" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
                <Badge variant={t.type === "INCOME" ? "income" : "expense"} className="text-[10px]">
                  {t.category.name}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
