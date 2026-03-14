"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || "Error al registrar")
      return
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
          <Input id="name" placeholder="Tu nombre" className="pl-10" {...register("name")} />
        </div>
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
      </div>

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
            placeholder="Mínimo 6 caracteres"
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
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-violet-600 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
