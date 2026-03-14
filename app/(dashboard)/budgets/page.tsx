import { Header } from "@/components/layout/Header"
import { BudgetList } from "@/components/budgets/BudgetList"

export default function BudgetsPage() {
  return (
    <div>
      <Header title="Presupuestos" />
      <BudgetList />
    </div>
  )
}
