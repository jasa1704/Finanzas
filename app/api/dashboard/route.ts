import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentMonthYear, getMonthName } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  const { month, year } = getCurrentMonthYear()

  // Current month stats
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59)

  const [incomeAgg, expenseAgg, transactionCount] = await Promise.all([
    db.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    db.transaction.count({ where: { userId, date: { gte: monthStart, lte: monthEnd } } }),
  ])

  const totalIncome = Number(incomeAgg._sum.amount || 0)
  const totalExpense = Number(expenseAgg._sum.amount || 0)

  // Last 6 months chart data
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const [inc, exp] = await Promise.all([
      db.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: mStart, lte: mEnd } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: mStart, lte: mEnd } },
        _sum: { amount: true },
      }),
    ])

    monthlyData.push({
      month: getMonthName(d.getMonth() + 1, true),
      income: Number(inc._sum.amount || 0),
      expense: Number(exp._sum.amount || 0),
    })
  }

  // Recent transactions
  const recentTransactions = await db.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5,
  })

  // Budget progress for current month
  const budgets = await db.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
  })

  const budgetProgress = await Promise.all(
    budgets.map(async (budget) => {
      const result = await db.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
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

  // All-time balance
  const [allIncome, allExpense] = await Promise.all([
    db.transaction.aggregate({ where: { userId, type: "INCOME" }, _sum: { amount: true } }),
    db.transaction.aggregate({ where: { userId, type: "EXPENSE" }, _sum: { amount: true } }),
  ])

  const balance = Number(allIncome._sum.amount || 0) - Number(allExpense._sum.amount || 0)

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    monthlyData,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      amount: t.amount.toString(),
    })),
    budgetProgress,
  })
}
