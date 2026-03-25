"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import { formatPrice } from "@/lib/utils"
import type { EquityPoint } from "@/types"

interface EquityCurveProps {
  data: EquityPoint[]
}

export function EquityCurve({ data }: EquityCurveProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Equity Curve</h3>
        <div className="h-32 flex items-center justify-center text-sm text-slate-400">
          Sin operaciones aún
        </div>
      </div>
    )
  }

  const isPositive = data[data.length - 1].equity >= data[0].equity

  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Equity Curve</h3>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            formatter={(v: number) => [formatPrice(v), "Equity"]}
            labelStyle={{ color: "#64748b" }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
