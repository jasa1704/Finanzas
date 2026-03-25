/**
 * BaseStrategy — interface all strategies must implement.
 *
 * Subclasses override evaluate() and return a Signal object.
 */
export class BaseStrategy {
  /** @param {string} name */
  constructor(name) {
    this.name = name
  }

  /**
   * Evaluate candles and return a trading signal.
   *
   * @param {Array<{timestamp,open,high,low,close,volume}>} candles
   * @returns {{ type: "BUY"|"SELL"|"HOLD", confidence: number, reason: string }}
   */
  // eslint-disable-next-line no-unused-vars
  evaluate(candles) {
    throw new Error(`${this.name}.evaluate() not implemented`)
  }

  /** Minimum number of candles this strategy requires */
  get minCandles() {
    return 30
  }
}
