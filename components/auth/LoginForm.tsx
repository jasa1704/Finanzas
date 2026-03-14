"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setError("")
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setError("Email o contraseña incorrectos")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
          <Input
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3 text-slate-400"
          >
            {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-violet-600 font-medium hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
