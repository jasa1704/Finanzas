import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-dvh bg-slate-50">
      <main className="pb-24 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
