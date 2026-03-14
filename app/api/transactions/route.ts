import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const categoryId = searchParams.get("categoryId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const limit = parseInt(searchParams.get("limit") || "50")
  const page = parseInt(searchParams.get("page") || "1")

  const where: Record<string, unknown> = { userId: session.user.id }
  if (type === "INCOME" || type === "EXPENSE") where.type = type
  if (categoryId) where.categoryId = categoryId
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
    }
  }

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.transaction.count({ where }),
  ])

  return NextResponse.json({ transactions, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)

    const transaction = await db.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: new Date(data.date),
      },
      include: { category: true },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
