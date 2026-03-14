export type TransactionType = "INCOME" | "EXPENSE"
export type CategoryType = "INCOME" | "EXPENSE" | "BOTH"

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  isSystem: boolean
  userId: string | null
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  amount: string | number
  type: TransactionType
  description: string | null
  date: string | Date
  createdAt: string | Date
  category: Category
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  month: number
  year: number
  limitAmount: string | number
  createdAt: string | Date
  category: Category
  spent?: number
  percentage?: number
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  monthlyData: MonthlyData[]
  recentTransactions: Transaction[]
  budgetProgress: Budget[]
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
}
