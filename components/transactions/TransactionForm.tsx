"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { transactionSchema, type TransactionInput } from "@/lib/validations"
import { type Category, type Transaction } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
  onSuccess?: () => void
}

export function TransactionForm({ open, onClose, transaction, onSuccess }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeType, setActiveType] = useState<"INCOME" | "EXPENSE">(
    transaction?.type || "EXPENSE"
  )
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || "EXPENSE",
      date: transaction?.date
        ? format(new Date(transaction.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      categoryId: transaction?.categoryId || "",
      amount: transaction?.amount ? Number(transaction.amount) : undefined,
      description: transaction?.description || "",
    },
  })

  const selectedCategoryId = watch("categoryId")

  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then(setCategories)
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
        categoryId: transaction.categoryId,
        amount: Number(transaction.amount),
        description: transaction.description || "",
      })
      setActiveType(transaction.type)
    } else {
      reset({
        type: activeType,
        date: format(new Date(), "yyyy-MM-dd"),
        categoryId: "",
        amount: undefined,
        description: "",
      })
    }
  }, [transaction, open])

  const filteredCategories = categories.filter(
    (c) => c.type === activeType || c.type === "BOTH"
  )

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    setActiveType(type)
    setValue("type", type)
    setValue("categoryId", "")
  }

  const onSubmit = async (data: TransactionInput) => {
    setError("")
    const url = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions"
    const method = transaction ? "PUT" : "POST"

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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeType === "EXPENSE"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeType === "INCOME"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Monto</Label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-medium">$</span>
              <Input
                type="number"
                step="any"
                placeholder="0"
                className="pl-8 text-lg font-semibold"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-rose-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Descripción (opcional)</Label>
            <Textarea
              placeholder="Agrega una nota..."
              rows={2}
              {...register("description")}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            variant={activeType === "INCOME" ? "income" : "expense"}
            loading={isSubmitting}
          >
            {transaction ? "Guardar cambios" : activeType === "INCOME" ? "Registrar ingreso" : "Registrar gasto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
