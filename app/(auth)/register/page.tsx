import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-dvh bg-gradient-to-br from-violet-50 to-slate-100 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <span className="text-white text-2xl font-bold">₿</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">FinanzApp</h1>
          <p className="text-slate-500 text-sm mt-1">Crea tu cuenta gratis</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Crear cuenta</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
