import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
})

export const transactionSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  amount: z.number().positive("El monto debe ser positivo"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.string().min(1, "Selecciona una fecha"),
})

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  limitAmount: z.number().positive("El límite debe ser positivo"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
