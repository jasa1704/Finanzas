import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * POST /api/bot/control
 * Body: { action: "start" | "stop" }
 *
 * Updates BotConfig.isActive in the DB.
 * The actual bot process (bot/index.js) polls this value
 * and responds accordingly.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const action = body?.action

  if (action !== "start" && action !== "stop") {
    return NextResponse.json({ error: "Invalid action. Use 'start' or 'stop'" }, { status: 400 })
  }

  const isActive = action === "start"

  const config = await db.botConfig.upsert({
    where: { userId: session.user.id },
    update: { isActive },
    create: {
      userId: session.user.id,
      isActive,
      exchange: "binance",
      symbol: "BTC/USDT",
      strategy: "EMA_CROSS",
      mode: "PAPER",
      capitalPercent: 2,
      maxDrawdown: 10,
      maxDailyLoss: 3,
    },
  })

  // Log the control event
  await db.botLog.create({
    data: {
      userId: session.user.id,
      level: "INFO",
      event: isActive ? "BOT_START_REQUESTED" : "BOT_STOP_REQUESTED",
      message: `Bot ${isActive ? "start" : "stop"} requested from dashboard`,
    },
  })

  return NextResponse.json({ isActive: config.isActive, mode: config.mode })
}
