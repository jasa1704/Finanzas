import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { type Budget } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetProgressProps {
  budgets: Budget[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (budgets.length === 0) return null

  return (
    <Card className="mx-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Presupuestos del mes</CardTitle>
        <Link href="/budgets" className="text-xs text-violet-600 font-medium flex items-center gap-0.5">
          Ver todos <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-4">
        {budgets.slice(0, 3).map((budget) => {
          const pct = budget.percentage || 0
          const isOver = pct >= 100
          return (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">{budget.category.name}</span>
                </div>
                <span className={`text-xs font-semibold ${isOver ? "text-rose-500" : "text-slate-500"}`}>
                  {formatCurrency(budget.spent || 0)} / {formatCurrency(Number(budget.limitAmount))}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              {isOver && (
                <p className="text-xs text-rose-500 font-medium">
                  ⚠ Excediste el límite en {formatCurrency((budget.spent || 0) - Number(budget.limitAmount))}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
