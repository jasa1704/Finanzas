import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency = "COP"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function getMonthName(month: number, short = false): string {
  const date = new Date(2024, month - 1, 1)
  return new Intl.DateTimeFormat("es-CO", { month: short ? "short" : "long" }).format(date)
}

export function getCurrentMonthYear() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
