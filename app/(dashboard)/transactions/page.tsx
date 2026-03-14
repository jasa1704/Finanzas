import { Header } from "@/components/layout/Header"
import { TransactionList } from "@/components/transactions/TransactionList"

export default function TransactionsPage() {
  return (
    <div>
      <Header title="Movimientos" />
      <TransactionList />
    </div>
  )
}
