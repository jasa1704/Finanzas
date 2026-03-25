import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Header } from "@/components/layout/Header"
import { PriceCard } from "@/components/dashboard/PriceCard"
import { BotStats } from "@/components/dashboard/BotStats"
import { EquityCurve } from "@/components/dashboard/EquityCurve"
import { RecentTrades } from "@/components/dashboard/RecentTrades"
import { BotStatusBadge } from "@/components/bot/BotStatusBadge"
import type { DashboardStats, EquityPoint } from "@/types"

async function getDashboardData(userId: string): Promise<DashboardStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [allTrades, todayTrades, openPositions, recentTrades] = await Promise.all([
    db.trade.findMany({ where: { userId, status: "CLOSED" } }),
    db.trade.findMany({ where: { userId, status: "CLOSED", closedAt: { gte: todayStart } } }),
    db.position.count({ where: { userId } }),
    db.trade.findMany({ where: { userId }, orderBy: { openedAt: "desc" }, take: 10 }),
  ])

  const totalPnl = allTrades.reduce((sum, t) => sum + parseFloat(t.pnl?.toString() ?? "0"), 0)
  const todayPnl = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl?.toString() ?? "0"), 0)

  const winners = allTrades.filter((t) => parseFloat(t.pnl?.toString() ?? "0") > 0)
  const winRate = allTrades.length > 0 ? (winners.length / allTrades.length) * 100 : 0

  // Build equity curve from closed trades (sorted by closedAt)
  const sortedTrades = [...allTrades].sort(
    (a, b) => new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime()
  )
  let runningEquity = 1000 // baseline capital
  const equityCurve: EquityPoint[] = sortedTrades.map((t) => {
    const pnl = parseFloat(t.pnl?.toString() ?? "0")
    runningEquity += pnl
    return {
      date: new Date(t.closedAt!).toLocaleDateString("es-CO", { month: "short", day: "numeric" }),
      equity: parseFloat(runningEquity.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
    }
  })

  return {
    totalPnl,
    todayPnl,
    winRate,
    totalTrades: allTrades.length,
    openPositions,
    currentPrice: null,
    equityCurve,
    recentTrades: recentTrades.map((t) => ({
      ...t,
      entryPrice: t.entryPrice.toString(),
      exitPrice: t.exitPrice?.toString() ?? null,
      quantity: t.quantity.toString(),
      pnl: t.pnl?.toString() ?? null,
      pnlPercent: t.pnlPercent?.toString() ?? null,
      stopLoss: t.stopLoss?.toString() ?? null,
      takeProfit: t.takeProfit?.toString() ?? null,
    })),
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [data, config] = await Promise.all([
    getDashboardData(session.user.id),
    db.botConfig.findUnique({ where: { userId: session.user.id } }),
  ])

  return (
    <div>
      <Header
        title="Dashboard"
        right={config && <BotStatusBadge isActive={config.isActive} mode={config.mode as "PAPER" | "LIVE"} />}
      />
      <div className="space-y-4 pt-4 pb-6 px-4">
        <PriceCard />
        <BotStats stats={data} />
        <EquityCurve data={data.equityCurve} />
        <RecentTrades trades={data.recentTrades as any} />
      </div>
    </div>
  )
}
