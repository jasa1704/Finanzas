import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🌱  Seeding trading bot database...")

  // Demo user
  const hashed = await bcrypt.hash("demo1234", 10)
  const user = await db.user.upsert({
    where: { email: "demo@tradingbot.dev" },
    update: {},
    create: {
      email: "demo@tradingbot.dev",
      name: "Demo Trader",
      hashedPassword: hashed,
    },
  })

  // Default bot config
  await db.botConfig.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
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

  // Sample paper trades
  const sampleTrades = [
    { side: "BUY",  entry: 68500, exit: 71200,  qty: 0.0029, daysAgo: 10 },
    { side: "BUY",  entry: 70100, exit: 69300,  qty: 0.0028, daysAgo: 7  },
    { side: "SELL", entry: 69800, exit: 68200,  qty: 0.0030, daysAgo: 5  },
    { side: "BUY",  entry: 67900, exit: 70500,  qty: 0.0031, daysAgo: 3  },
    { side: "BUY",  entry: 71000, exit: null,   qty: 0.0028, daysAgo: 1  },
  ]

  for (const t of sampleTrades) {
    const openedAt  = new Date(Date.now() - t.daysAgo * 86_400_000)
    const closedAt  = t.exit ? new Date(openedAt.getTime() + 86_400_000) : null
    const pnl       = t.exit
      ? t.side === "BUY"
        ? (t.exit - t.entry) * t.qty
        : (t.entry - t.exit) * t.qty
      : null
    const pnlPercent = t.exit
      ? ((t.exit - t.entry) / t.entry) * 100 * (t.side === "BUY" ? 1 : -1)
      : null

    await db.trade.create({
      data: {
        userId:       user.id,
        symbol:       "BTC/USDT",
        side:         t.side as any,
        entryPrice:   t.entry,
        exitPrice:    t.exit ?? undefined,
        quantity:     t.qty,
        pnl:          pnl       ?? undefined,
        pnlPercent:   pnlPercent ?? undefined,
        status:       t.exit ? "CLOSED" : "OPEN",
        strategy:     "EMA_CROSS",
        stopLoss:     t.side === "BUY" ? t.entry * 0.985 : t.entry * 1.015,
        takeProfit:   t.side === "BUY" ? t.entry * 1.030 : t.entry * 0.970,
        openedAt,
        closedAt,
      },
    })
  }

  // Sample log entries
  const logEntries = [
    { level: "INFO",   event: "BOT_START",       message: "Bot started in PAPER mode" },
    { level: "SIGNAL", event: "SIGNAL",           message: "EMA(9) crossed above EMA(21) — BUY signal" },
    { level: "ORDER",  event: "POSITION_OPENED",  message: "BUY 0.0029 BTC/USDT @ 68500" },
    { level: "ORDER",  event: "POSITION_CLOSED",  message: "Closed BTC/USDT @ 71200 | PnL: +7.83 USDT" },
    { level: "INFO",   event: "BOT_STOP",         message: "Bot stopped — manual" },
  ]

  for (const entry of logEntries) {
    await db.botLog.create({
      data: {
        userId:  user.id,
        level:   entry.level as any,
        event:   entry.event,
        message: entry.message,
      },
    })
  }

  console.log("✅  Seed complete — demo@tradingbot.dev / demo1234")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
