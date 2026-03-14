import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await db.budget.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  try {
    const body = await req.json()
    const data = budgetSchema.parse(body)
    const budget = await db.budget.update({
      where: { id },
      data: { limitAmount: data.limitAmount, month: data.month, year: data.year, categoryId: data.categoryId },
      include: { category: true },
    })
    return NextResponse.json(budget)
  } catch (error) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await db.budget.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await db.budget.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
