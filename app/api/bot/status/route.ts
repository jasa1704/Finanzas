import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const config = await db.botConfig.findUnique({
    where: { userId: session.user.id },
  })

  if (!config) {
    return NextResponse.json({ isActive: false, mode: "PAPER", strategy: "EMA_CROSS", symbol: "BTC/USDT", lastCheck: null })
  }

  return NextResponse.json({
    isActive: config.isActive,
    mode: config.mode,
    strategy: config.strategy,
    symbol: config.symbol,
    lastCheck: config.updatedAt.toISOString(),
  })
}
