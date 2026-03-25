import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatPrice(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatPnl(pnl: number | string): string {
  const n = typeof pnl === "string" ? parseFloat(pnl) : pnl
  const sign = n >= 0 ? "+" : ""
  return `${sign}${formatPrice(n)}`
}

export function formatPercent(value: number | string, decimals = 2): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(decimals)}%`
}

export function formatQuantity(qty: number | string): string {
  const n = typeof qty === "string" ? parseFloat(qty) : qty
  return n.toFixed(6)
}
