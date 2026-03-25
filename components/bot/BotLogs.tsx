import { formatDateTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { BotLog } from "@/types"

interface BotLogsProps {
  logs: BotLog[]
}

const LEVEL_STYLES: Record<string, string> = {
  INFO: "text-slate-500",
  WARN: "text-amber-600",
  ERROR: "text-red-600",
  SIGNAL: "text-violet-600",
  ORDER: "text-emerald-600",
}

const LEVEL_BG: Record<string, string> = {
  INFO: "bg-slate-100",
  WARN: "bg-amber-100",
  ERROR: "bg-red-100",
  SIGNAL: "bg-violet-100",
  ORDER: "bg-emerald-100",
}

export function BotLogs({ logs }: BotLogsProps) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Logs Recientes</h3>

      {logs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Sin actividad registrada</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2.5 text-xs">
              <span className={cn(
                "shrink-0 px-1.5 py-0.5 rounded font-medium",
                LEVEL_BG[log.level],
                LEVEL_STYLES[log.level]
              )}>
                {log.level}
              </span>
              <div className="min-w-0">
                <span className="text-slate-400">{formatDateTime(log.createdAt)} · </span>
                <span className="font-medium text-slate-600">{log.event}: </span>
                <span className="text-slate-700">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
