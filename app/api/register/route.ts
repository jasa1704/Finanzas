import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await db.user.create({
      data: { name, email, hashedPassword },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
