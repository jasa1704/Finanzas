import { cn } from "@/lib/utils"
import type { BotMode } from "@/types"

interface BotStatusBadgeProps {
  isActive: boolean
  mode: BotMode
}

export function BotStatusBadge({ isActive, mode }: BotStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      )}>
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        )} />
        {isActive ? "Activo" : "Detenido"}
      </span>

      <span className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-full",
        mode === "LIVE"
          ? "bg-red-100 text-red-700"
          : "bg-violet-100 text-violet-700"
      )}>
        {mode === "LIVE" ? "⚡ LIVE" : "📄 PAPER"}
      </span>
    </div>
  )
}
