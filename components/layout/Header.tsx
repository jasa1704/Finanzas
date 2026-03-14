"use client"

import { signOut, useSession } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100 safe-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">₿</span>
          </div>
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{session?.user?.name || session?.user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </header>
  )
}
