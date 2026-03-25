import { EMA } from "technicalindicators"
import { BaseStrategy } from "./BaseStrategy.js"

/**
 * EMA Cross Strategy — generates BUY/SELL signals when the fast EMA
 * crosses above/below the slow EMA.
 *
 * Default: EMA(9) crosses EMA(21)
 */
export class EMACrossStrategy extends BaseStrategy {
  #fastPeriod
  #slowPeriod

  constructor(fastPeriod = 9, slowPeriod = 21) {
    super("EMA_CROSS")
    this.#fastPeriod = fastPeriod
    this.#slowPeriod = slowPeriod
  }

  get minCandles() {
    return this.#slowPeriod + 5
  }

  evaluate(candles) {
    if (candles.length < this.minCandles) {
      return { type: "HOLD", confidence: 0, reason: "Not enough candles" }
    }

    const closes = candles.map((c) => c.close)

    const fastValues = EMA.calculate({ period: this.#fastPeriod, values: closes })
    const slowValues = EMA.calculate({ period: this.#slowPeriod, values: closes })

    // Align arrays (slow EMA is shorter)
    const offset = fastValues.length - slowValues.length
    const alignedFast = fastValues.slice(offset)

    const prev = {
      fast: alignedFast[alignedFast.length - 2],
      slow: slowValues[slowValues.length - 2],
    }
    const curr = {
      fast: alignedFast[alignedFast.length - 1],
      slow: slowValues[slowValues.length - 1],
    }

    // Golden cross: fast crosses above slow
    if (prev.fast <= prev.slow && curr.fast > curr.slow) {
      return {
        type: "BUY",
        confidence: 0.75,
        reason: `EMA(${this.#fastPeriod}) crossed above EMA(${this.#slowPeriod})`,
        emaFast: curr.fast,
        emaSlow: curr.slow,
      }
    }

    // Death cross: fast crosses below slow
    if (prev.fast >= prev.slow && curr.fast < curr.slow) {
      return {
        type: "SELL",
        confidence: 0.75,
        reason: `EMA(${this.#fastPeriod}) crossed below EMA(${this.#slowPeriod})`,
        emaFast: curr.fast,
        emaSlow: curr.slow,
      }
    }

    // No cross — determine trend bias
    const trending = curr.fast > curr.slow ? "bullish" : "bearish"
    return {
      type: "HOLD",
      confidence: 0.3,
      reason: `No cross — ${trending} trend (EMA${this.#fastPeriod}=${curr.fast.toFixed(2)}, EMA${this.#slowPeriod}=${curr.slow.toFixed(2)})`,
      emaFast: curr.fast,
      emaSlow: curr.slow,
    }
  }
}
