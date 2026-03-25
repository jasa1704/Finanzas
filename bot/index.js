/**
 * Bot entry point.
 *
 * Run with: npm run bot:dev
 *
 * Requires .env with:
 *   DATABASE_URL, EXCHANGE_API_KEY, EXCHANGE_SECRET,
 *   BOT_USER_ID, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { BotEngine } from "./core/BotEngine.js"

const userId = process.env.BOT_USER_ID
if (!userId) {
  console.error("❌  BOT_USER_ID is not set in .env")
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set in .env")
  process.exit(1)
}

async function main() {
  // Load config from DB
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter })

  const config = await db.botConfig.findUnique({ where: { userId } })
  if (!config) {
    console.error("❌  No BotConfig found for user. Create one in the dashboard first.")
    await db.$disconnect()
    process.exit(1)
  }

  await db.$disconnect()

  const engine = new BotEngine({
    userId,
    exchange: config.exchange,
    symbol: config.symbol,
    strategy: config.strategy,
    mode: config.mode,
    capitalPercent: Number(config.capitalPercent),
    maxDrawdown: Number(config.maxDrawdown),
    maxDailyLoss: Number(config.maxDailyLoss),
    capital: Number(process.env.BOT_CAPITAL ?? 1000),
  })

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑  Shutting down bot...")
    await engine.stop("SIGINT received")
    process.exit(0)
  })

  process.on("SIGTERM", async () => {
    await engine.stop("SIGTERM received")
    process.exit(0)
  })

  await engine.start()
  console.log("🤖  Bot is running. Press Ctrl+C to stop.")
}

main().catch((err) => {
  console.error("💥  Fatal error:", err)
  process.exit(1)
})
