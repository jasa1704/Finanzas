"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Trash2, Filter, X } from "lucide-react"
import { type Transaction, type Category } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "./TransactionForm"
import { DeleteTransactionDialog } from "./DeleteTransactionDialog"
import { TransactionFilters } from "./TransactionFilters"

const PAGE_SIZE = 20

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [filters, setFilters] = useState({ type: "all", categoryId: "", from: "", to: "" })

  const fetchTransactions = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 1 : page
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(currentPage),
      ...(filters.type !== "all" ? { type: filters.type } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    })
    const res = await fetch(`/api/transactions?${params}`)
    const data = await res.json()
    setTransactions(data.transactions || [])
    setTotal(data.total || 0)
    if (reset) setPage(1)
    setLoading(false)
  }, [filters, page])

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filters, page])

  const handleFilterChange = (f: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...f }))
    setPage(1)
  }

  const activeFiltersCount = [
    filters.type !== "all",
    !!filters.categoryId,
    !!filters.from,
    !!filters.to,
  ].filter(Boolean).length

  return (
    <div>
      {/* Filter toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white sticky top-14 z-20">
        <p className="text-sm text-slate-500">{total} movimientos</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 h-8 text-xs"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-violet-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-100 pt-3">
          <TransactionFilters filters={filters} categories={categories} onChange={handleFilterChange} />
        </div>
      )}

      {/* List */}
      <div className="px-4 py-2 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No hay movimientos</p>
            <p className="text-slate-300 text-xs mt-1">
              {activeFiltersCount > 0 ? "Prueba otros filtros" : "Usa el botón + para agregar"}
            </p>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-50 shadow-sm"
            >
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
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                  <Badge variant={t.type === "INCOME" ? "income" : "expense"} className="text-[10px] py-0">
                    {t.category.name}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <p className={`text-sm font-semibold mr-1 ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                  {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(t)}>
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(t.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-500">
              {page} / {Math.ceil(total / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      <TransactionForm
        open={!!editTarget}
        transaction={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => fetchTransactions(true)}
      />
      {deleteTarget && (
        <DeleteTransactionDialog
          open={!!deleteTarget}
          transactionId={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => fetchTransactions(true)}
        />
      )}
    </div>
  )
}
