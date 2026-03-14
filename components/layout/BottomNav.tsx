"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { TransactionForm } from "@/components/transactions/TransactionForm"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: PiggyBank },
]

export function BottomNav() {
  const pathname = usePathname()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 safe-bottom">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          {navItems.slice(0, 2).map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-w-[64px]",
                  active ? "text-violet-600" : "text-slate-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Add button */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200 -translate-y-3 active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>

          {navItems.slice(2).map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-w-[64px]",
                  active ? "text-violet-600" : "text-slate-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <TransactionForm open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
