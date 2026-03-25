// ─── Enums ─────────────────────────────────────────────────────────────────

export type TradeSide = "BUY" | "SELL"
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELLED"
export type BotMode = "PAPER" | "LIVE"
export type LogLevel = "INFO" | "WARN" | "ERROR" | "SIGNAL" | "ORDER"
export type BotStatus = "RUNNING" | "PAUSED" | "STOPPED"

// ─── Domain Types ──────────────────────────────────────────────────────────

export interface Trade {
  id: string
  userId: string
  symbol: string
  side: TradeSide
  entryPrice: string | number
  exitPrice: string | number | null
  quantity: string | number
  pnl: string | number | null
  pnlPercent: string | number | null
  status: TradeStatus
  strategy: string | null
  stopLoss: string | number | null
  takeProfit: string | number | null
  orderId: string | null
  openedAt: string | Date
  closedAt: string | Date | null
  createdAt: string | Date
}

export interface Position {
  id: string
  userId: string
  symbol: string
  side: TradeSide
  entryPrice: string | number
  quantity: string | number
  stopLoss: string | number | null
  takeProfit: string | number | null
  orderId: string | null
  strategy: string | null
  openedAt: string | Date
}

export interface BotConfig {
  id: string
  userId: string
  exchange: string
  symbol: string
  strategy: string
  isActive: boolean
  mode: BotMode
  capitalPercent: string | number
  maxDrawdown: string | number
  maxDailyLoss: string | number
}

export interface BotLog {
  id: string
  userId: string
  level: LogLevel
  event: string
  message: string
  metadata: Record<string, unknown> | null
  createdAt: string | Date
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPnl: number
  todayPnl: number
  winRate: number
  totalTrades: number
  openPositions: number
  currentPrice: number | null
  equityCurve: EquityPoint[]
  recentTrades: Trade[]
}

export interface EquityPoint {
  date: string
  equity: number
  pnl: number
}

// ─── API Payloads ───────────────────────────────────────────────────────────

export interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  timestamp: number
}

export interface BotStatusPayload {
  isActive: boolean
  mode: BotMode
  strategy: string
  symbol: string
  lastCheck: string | null
}

export interface Signal {
  type: "BUY" | "SELL" | "HOLD"
  strategy: string
  confidence: number
  reason: string
  timestamp: number
}
