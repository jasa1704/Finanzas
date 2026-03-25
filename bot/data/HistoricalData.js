/**
 * HistoricalData — fetches and caches OHLCV candles for strategy evaluation
 * and backtesting.
 */
export class HistoricalData {
  #client
  /** @type {Map<string, Array>} */
  #cache = new Map()

  /** @param {import("../exchange/ExchangeClient.js").ExchangeClient} client */
  constructor(client) {
    this.#client = client
  }

  /**
   * Get recent candles (uses cache key = symbol:timeframe)
   * @param {string} symbol
   * @param {string} timeframe
   * @param {number} limit
   */
  async getCandles(symbol = "BTC/USDT", timeframe = "1h", limit = 100) {
    const candles = await this.#client.getCandles(symbol, timeframe, limit)
    const key = `${symbol}:${timeframe}`
    this.#cache.set(key, candles)
    return candles
  }

  /**
   * Returns cached candles without a network request.
   * @param {string} symbol
   * @param {string} timeframe
   */
  getCached(symbol, timeframe) {
    return this.#cache.get(`${symbol}:${timeframe}`) ?? []
  }

  /**
   * Extract close prices from candle array.
   * @param {Array} candles
   */
  static closes(candles) {
    return candles.map((c) => c.close)
  }

  /**
   * Extract high prices from candle array.
   * @param {Array} candles
   */
  static highs(candles) {
    return candles.map((c) => c.high)
  }

  /**
   * Extract low prices from candle array.
   * @param {Array} candles
   */
  static lows(candles) {
    return candles.map((c) => c.low)
  }
}
