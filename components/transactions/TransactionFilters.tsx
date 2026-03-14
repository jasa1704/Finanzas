"use client"

import { type Category } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Filters {
  type: string
  categoryId: string
  from: string
  to: string
}

interface TransactionFiltersProps {
  filters: Filters
  categories: Category[]
  onChange: (filters: Partial<Filters>) => void
}

export function TransactionFilters({ filters, categories, onChange }: TransactionFiltersProps) {
  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="flex rounded-xl bg-slate-100 p-1">
        {(["all", "EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange({ type: t })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {t === "all" ? "Todos" : t === "EXPENSE" ? "Gastos" : "Ingresos"}
          </button>
        ))}
      </div>

      <Select
        value={filters.categoryId || "all"}
        onValueChange={(v) => onChange({ categoryId: v === "all" ? "" : v })}
      >
        <SelectTrigger className="h-10 text-sm">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
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

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ from: e.target.value })}
            className="h-10 text-sm"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ to: e.target.value })}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
