"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Category, type Budget } from "@/types"
import { budgetSchema, type BudgetInput } from "@/lib/validations"
import { getCurrentMonthYear, getMonthName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BudgetFormProps {
  open: boolean
  onClose: () => void
  budget?: Budget | null
  onSuccess?: () => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1),
}))

export function BudgetForm({ open, onClose, budget, onSuccess }: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState("")
  const { month, year } = getCurrentMonthYear()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: budget?.categoryId || "",
      limitAmount: budget?.limitAmount ? Number(budget.limitAmount) : undefined,
      month: budget?.month || month,
      year: budget?.year || year,
    },
  })

  const selectedCategoryId = watch("categoryId")
  const selectedMonth = watch("month")
  const selectedYear = watch("year")

  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((cats: Category[]) => setCategories(cats.filter((c) => c.type === "EXPENSE" || c.type === "BOTH")))
    }
  }, [open])

  useEffect(() => {
    if (budget) {
      reset({
        categoryId: budget.categoryId,
        limitAmount: Number(budget.limitAmount),
        month: budget.month,
        year: budget.year,
      })
    } else {
      reset({ categoryId: "", limitAmount: undefined, month, year })
    }
  }, [budget, open])

  const onSubmit = async (data: BudgetInput) => {
    setError("")
    const url = budget ? `/api/budgets/${budget.id}` : "/api/budgets"
    const method = budget ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || "Error al guardar")
      return
    }

    onClose()
    onSuccess?.()
    reset()
  }

  const years = [year - 1, year, year + 1]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={selectedCategoryId} onValueChange={(v) => setValue("categoryId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-rose-500">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Límite mensual</Label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-medium">$</span>
              <Input
                type="number"
                step="any"
                placeholder="0"
                className="pl-8 text-lg font-semibold"
                {...register("limitAmount", { valueAsNumber: true })}
              />
            </div>
            {errors.limitAmount && <p className="text-xs text-rose-500">{errors.limitAmount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mes</Label>
              <Select value={String(selectedMonth)} onValueChange={(v) => setValue("month", Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setValue("year", Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            {budget ? "Guardar cambios" : "Crear presupuesto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
