import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") // "OPEN" | "CLOSED" | "CANCELLED"
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100)

  const trades = await db.trade.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { openedAt: "desc" },
    take: limit,
  })

  return NextResponse.json(
    trades.map((t) => ({
      ...t,
      entryPrice: t.entryPrice.toString(),
      exitPrice: t.exitPrice?.toString() ?? null,
      quantity: t.quantity.toString(),
      pnl: t.pnl?.toString() ?? null,
      pnlPercent: t.pnlPercent?.toString() ?? null,
      stopLoss: t.stopLoss?.toString() ?? null,
      takeProfit: t.takeProfit?.toString() ?? null,
    }))
  )
}
