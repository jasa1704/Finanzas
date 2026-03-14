import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations"
import { getCurrentMonthYear } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const month = parseInt(searchParams.get("month") || String(currentMonth))
  const year = parseInt(searchParams.get("year") || String(currentYear))

  const budgets = await db.budget.findMany({
    where: { userId: session.user.id, month, year },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  // Calculate spent amount for each budget
  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      const result = await db.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
        _sum: { amount: true },
      })
      const spent = Number(result._sum.amount || 0)
      const limit = Number(budget.limitAmount)
      return {
        ...budget,
        limitAmount: budget.limitAmount.toString(),
        spent,
        percentage: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0,
      }
    })
  )

  return NextResponse.json(budgetsWithProgress)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = budgetSchema.parse(body)

    const budget = await db.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
      update: { limitAmount: data.limitAmount },
      create: {
        userId: session.user.id,
        categoryId: data.categoryId,
        limitAmount: data.limitAmount,
        month: data.month,
        year: data.year,
      },
      include: { category: true },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
