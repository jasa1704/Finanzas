"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { type Budget } from "@/types"
import { getCurrentMonthYear, getMonthName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BudgetCard } from "./BudgetCard"
import { BudgetForm } from "./BudgetForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function BudgetList() {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Budget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
    const data = await res.json()
    setBudgets(data)
    setLoading(false)
  }, [month, year])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await fetch(`/api/budgets/${deleteTarget}`, { method: "DELETE" })
    setDeleteLoading(false)
    setDeleteTarget(null)
    fetchBudgets()
  }

  return (
    <div>
      {/* Month selector */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100 sticky top-14 z-20">
        <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-sm font-semibold text-slate-900">
          {getMonthName(month)} {year}
        </p>
        <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))
        ) : budgets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🐷</span>
            </div>
            <p className="text-slate-600 text-sm font-medium">Sin presupuestos para {getMonthName(month)}</p>
            <p className="text-slate-400 text-xs mt-1">Crea uno para controlar tus gastos</p>
          </div>
        ) : (
          budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={(budget) => { setEditTarget(budget); setFormOpen(true) }}
              onDelete={setDeleteTarget}
            />
          ))
        )}

        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => { setEditTarget(null); setFormOpen(true) }}
        >
          <Plus className="h-4 w-4" />
          Nuevo presupuesto
        </Button>
      </div>

      <BudgetForm
        open={formOpen}
        budget={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSuccess={fetchBudgets}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar presupuesto?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={deleteLoading}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
