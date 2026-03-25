import { ATR } from "technicalindicators"

/**
 * RiskManager — validates signals and calculates position sizes.
 *
 * Rules:
 *   - Max capital per trade: configurable (default 2%)
 *   - Max simultaneous risk: 5% of total capital
 *   - Stop loss: ATR(14) × 1.5
 *   - Take profit: 2× the risk (2:1 reward/risk ratio)
 *   - Auto-pause if daily drawdown > maxDailyLoss %
 *   - Auto-pause if total drawdown > maxDrawdown %
 */
export class RiskManager {
  #config

  /**
   * @param {{
   *   capitalPercent: number,  // % of capital per trade (e.g. 2)
   *   maxDrawdown: number,     // % total drawdown limit (e.g. 10)
   *   maxDailyLoss: number,    // % daily loss limit (e.g. 3)
   *   maxOpenPositions: number // (default 3)
   * }} config
   */
  constructor(config) {
    this.#config = {
      capitalPercent: 2,
      maxDrawdown: 10,
      maxDailyLoss: 3,
      maxOpenPositions: 3,
      ...config,
    }
  }

  /**
   * Calculate position size and stop/take-profit levels.
   *
   * @param {{
   *   signal: { type: string },
   *   currentPrice: number,
   *   candles: Array,
   *   totalCapital: number,
   *   openPositions: number
   * }} params
   * @returns {{ approved: boolean, reason?: string, size?: number, stopLoss?: number, takeProfit?: number }}
   */
  validate({ signal, currentPrice, candles, totalCapital, openPositions }) {
    if (signal.type === "HOLD") {
      return { approved: false, reason: "Signal is HOLD" }
    }

    if (openPositions >= this.#config.maxOpenPositions) {
      return {
        approved: false,
        reason: `Max open positions reached (${this.#config.maxOpenPositions})`,
      }
    }

    const atr = this.#calcATR(candles)
    if (!atr) {
      return { approved: false, reason: "Not enough data for ATR calculation" }
    }

    const stopDistance = atr * 1.5
    const capitalAtRisk = totalCapital * (this.#config.capitalPercent / 100)
    const size = capitalAtRisk / stopDistance

    const stopLoss =
      signal.type === "BUY"
        ? currentPrice - stopDistance
        : currentPrice + stopDistance

    const takeProfit =
      signal.type === "BUY"
        ? currentPrice + stopDistance * 2
        : currentPrice - stopDistance * 2

    return {
      approved: true,
      size: parseFloat(size.toFixed(6)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: parseFloat(takeProfit.toFixed(2)),
      atr,
      stopDistance,
    }
  }

  /**
   * Check whether global circuit breakers should pause the bot.
   *
   * @param {{ dailyPnl: number, totalPnl: number, capital: number }} portfolio
   * @returns {{ shouldPause: boolean, reason?: string }}
   */
  checkCircuitBreaker({ dailyPnl, totalPnl, capital }) {
    const dailyLossPct = Math.abs(dailyPnl / capital) * 100
    const totalDrawdownPct = Math.abs(Math.min(0, totalPnl) / capital) * 100

    if (dailyLossPct >= this.#config.maxDailyLoss) {
      return {
        shouldPause: true,
        reason: `Daily loss limit reached: ${dailyLossPct.toFixed(2)}% >= ${this.#config.maxDailyLoss}%`,
        pauseDuration: "24h",
      }
    }

    if (totalDrawdownPct >= this.#config.maxDrawdown) {
      return {
        shouldPause: true,
        reason: `Max drawdown reached: ${totalDrawdownPct.toFixed(2)}% >= ${this.#config.maxDrawdown}%`,
        pauseDuration: "manual_review",
      }
    }

    return { shouldPause: false }
  }

  #calcATR(candles, period = 14) {
    if (candles.length < period + 1) return null
    const result = ATR.calculate({
      period,
      high: candles.map((c) => c.high),
      low: candles.map((c) => c.low),
      close: candles.map((c) => c.close),
    })
    return result[result.length - 1] ?? null
  }
}
