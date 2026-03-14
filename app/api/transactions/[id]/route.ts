import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await db.transaction.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const data = transactionSchema.parse(body)

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: new Date(data.date),
      },
      include: { category: true },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
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

  const existing = await db.transaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  await db.transaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
