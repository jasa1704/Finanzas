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

export const botConfigSchema = z.object({
  exchange: z.enum(["binance", "bybit", "kraken"]),
  symbol: z.string().min(1),
  strategy: z.string().min(1),
  mode: z.enum(["PAPER", "LIVE"]),
  capitalPercent: z.number().min(0.1).max(10),
  maxDrawdown: z.number().min(1).max(50),
  maxDailyLoss: z.number().min(0.5).max(20),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BotConfigInput = z.infer<typeof botConfigSchema>
