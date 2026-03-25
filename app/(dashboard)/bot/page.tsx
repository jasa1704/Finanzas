import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Header } from "@/components/layout/Header"
import { BotControl } from "@/components/bot/BotControl"
import { BotLogs } from "@/components/bot/BotLogs"

export default async function BotPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  let config = await db.botConfig.findUnique({ where: { userId: session.user.id } })

  // Auto-create default config on first visit
  if (!config) {
    config = await db.botConfig.create({
      data: {
        userId: session.user.id,
        exchange: "binance",
        symbol: "BTC/USDT",
        strategy: "EMA_CROSS",
        mode: "PAPER",
        isActive: false,
        capitalPercent: 2,
        maxDrawdown: 10,
        maxDailyLoss: 3,
      },
    })
  }

  const logs = await db.botLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return (
    <div>
      <Header title="Bot" />
      <div className="space-y-4 pt-4 pb-6 px-4">
        <BotControl config={{
          ...config,
          capitalPercent: config.capitalPercent.toString(),
          maxDrawdown: config.maxDrawdown.toString(),
          maxDailyLoss: config.maxDailyLoss.toString(),
          mode: config.mode as "PAPER" | "LIVE",
        }} />
        <BotLogs logs={logs.map((l) => ({
          ...l,
          metadata: l.metadata as Record<string, unknown> | null,
          level: l.level as any,
        }))} />
      </div>
    </div>
  )
}
