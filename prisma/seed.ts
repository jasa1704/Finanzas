import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const systemCategories = [
  // Income
  { name: "Salario", type: "INCOME" as const, color: "#10b981", icon: "briefcase" },
  { name: "Freelance", type: "INCOME" as const, color: "#059669", icon: "laptop" },
  { name: "Inversiones", type: "INCOME" as const, color: "#0d9488", icon: "trending-up" },
  { name: "Negocio", type: "INCOME" as const, color: "#0891b2", icon: "store" },
  { name: "Otros ingresos", type: "INCOME" as const, color: "#6366f1", icon: "plus-circle" },
  // Expense
  { name: "Alimentación", type: "EXPENSE" as const, color: "#f43f5e", icon: "utensils" },
  { name: "Transporte", type: "EXPENSE" as const, color: "#f97316", icon: "car" },
  { name: "Vivienda", type: "EXPENSE" as const, color: "#eab308", icon: "home" },
  { name: "Salud", type: "EXPENSE" as const, color: "#ec4899", icon: "heart" },
  { name: "Entretenimiento", type: "EXPENSE" as const, color: "#a855f7", icon: "tv" },
  { name: "Educación", type: "EXPENSE" as const, color: "#3b82f6", icon: "book-open" },
  { name: "Ropa", type: "EXPENSE" as const, color: "#8b5cf6", icon: "shirt" },
  { name: "Servicios", type: "EXPENSE" as const, color: "#06b6d4", icon: "zap" },
  { name: "Restaurantes", type: "EXPENSE" as const, color: "#ef4444", icon: "coffee" },
  { name: "Viajes", type: "EXPENSE" as const, color: "#14b8a6", icon: "plane" },
  { name: "Mascotas", type: "EXPENSE" as const, color: "#d97706", icon: "paw-print" },
  { name: "Deportes", type: "EXPENSE" as const, color: "#22c55e", icon: "dumbbell" },
  { name: "Otros gastos", type: "EXPENSE" as const, color: "#94a3b8", icon: "more-horizontal" },
]

async function main() {
  console.log("Seeding system categories...")
  for (const category of systemCategories) {
    await prisma.category.upsert({
      where: {
        id: `system_${category.name.toLowerCase().replace(/\s/g, "_")}`,
      },
      update: {},
      create: {
        id: `system_${category.name.toLowerCase().replace(/\s/g, "_")}`,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        isSystem: true,
        userId: null,
      },
    })
  }
  console.log(`✅ ${systemCategories.length} system categories created`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
