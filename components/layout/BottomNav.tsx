"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bot, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bot", label: "Bot", icon: Bot },
  { href: "/trades", label: "Trades", icon: ListOrdered },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 safe-bottom">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-colors min-w-[72px]",
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
  )
}
