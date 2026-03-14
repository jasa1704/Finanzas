import { Header } from "@/components/layout/Header"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { MonthlyChart } from "@/components/dashboard/MonthlyChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { auth } from "@/lib/auth"
import { type DashboardStats } from "@/types"
import { getMonthName, getCurrentMonthYear } from "@/lib/utils"

async function getDashboardData(): Promise<DashboardStats | null> {
  try {
    const session = await auth()
    if (!session?.user) return null

    const { db } = await import("@/lib/db")
    const { getCurrentMonthYear, getMonthName } = await import("@/lib/utils")
    const { month, year } = getCurrentMonthYear()

    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)
    const userId = session.user.id

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

    // Last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1)
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const [inc, exp] = await Promise.all([
        db.transaction.aggregate({ where: { userId, type: "INCOME", date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
        db.transaction.aggregate({ where: { userId, type: "EXPENSE", date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
      ])
      monthlyData.push({
        month: getMonthName(d.getMonth() + 1, true),
        income: Number(inc._sum.amount || 0),
        expense: Number(exp._sum.amount || 0),
      })
    }

    const recentTransactions = await db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    })

    const budgets = await db.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    })

    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
        const result = await db.transaction.aggregate({
          where: { userId, categoryId: budget.categoryId, type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        })
        const spent = Number(result._sum.amount || 0)
        const limit = Number(budget.limitAmount)
        return { ...budget, limitAmount: budget.limitAmount.toString(), spent, percentage: limit > 0 ? Math.min((spent / limit) * 100, 100) : 0 }
      })
    )

    const [allIncome, allExpense] = await Promise.all([
      db.transaction.aggregate({ where: { userId, type: "INCOME" }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { userId, type: "EXPENSE" }, _sum: { amount: true } }),
    ])
    const balance = Number(allIncome._sum.amount || 0) - Number(allExpense._sum.amount || 0)

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      monthlyData,
      recentTransactions: recentTransactions.map((t) => ({ ...t, amount: t.amount.toString() })),
      budgetProgress,
    }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { month, year } = getCurrentMonthYear()

  return (
    <div>
      <Header title={`${getMonthName(month)} ${year}`} />
      <div className="space-y-4 pt-4 pb-6">
        <StatsCards
          balance={data?.balance ?? 0}
          totalIncome={data?.totalIncome ?? 0}
          totalExpense={data?.totalExpense ?? 0}
          transactionCount={data?.transactionCount ?? 0}
        />
        <MonthlyChart data={data?.monthlyData ?? []} />
        <RecentTransactions transactions={(data?.recentTransactions ?? []) as any} />
        {(data?.budgetProgress?.length ?? 0) > 0 && (
          <BudgetProgress budgets={data!.budgetProgress as any} />
        )}
      </div>
    </div>
  )
}
