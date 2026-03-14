import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const categories = await db.category.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: session.user.id }],
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })

  return NextResponse.json(categories)
}
