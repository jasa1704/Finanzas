"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { type MonthlyData } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyChartProps {
  data: MonthlyData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
            {p.dataKey === "income" ? "Ingresos" : "Gastos"}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle>Últimos 6 meses</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={14} barGap={4}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }} />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Ingresos" />
            <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Gastos" />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => (v === "income" ? "Ingresos" : "Gastos")}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
