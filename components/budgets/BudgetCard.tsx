"use client"

import { Pencil, Trash2 } from "lucide-react"
import { type Budget } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const pct = budget.percentage || 0
  const spent = budget.spent || 0
  const limit = Number(budget.limitAmount)
  const remaining = limit - spent
  const isOver = pct >= 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: budget.category.color }}
            >
              {budget.category.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{budget.category.name}</p>
              <p className="text-xs text-slate-400">Límite: {formatCurrency(limit)}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(budget)}>
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(budget.id)}>
              <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>
        </div>

        <Progress value={pct} className="h-2.5 mb-2" />

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isOver ? "text-rose-500" : "text-slate-500"}`}>
            {isOver ? `Excedido en ${formatCurrency(spent - limit)}` : `Disponible: ${formatCurrency(remaining)}`}
          </span>
          <span className={`text-xs font-bold ${isOver ? "text-rose-500" : pct > 75 ? "text-amber-500" : "text-emerald-600"}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
