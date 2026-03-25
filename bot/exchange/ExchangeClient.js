import ccxt from "ccxt"

/**
 * ExchangeClient — wraps ccxt for a single exchange instance.
 * API keys are read from environment variables only (never hardcoded).
 *
 * Supported: binance | bybit | kraken
 */
export class ExchangeClient {
  /** @type {ccxt.Exchange} */
  #exchange

  /** @param {"binance"|"bybit"|"kraken"} exchangeId */
  constructor(exchangeId = "binance") {
    const config = {
      apiKey: process.env.EXCHANGE_API_KEY,
      secret: process.env.EXCHANGE_SECRET,
      enableRateLimit: true,
      options: { defaultType: "spot" },
    }

    if (!ccxt[exchangeId]) {
      throw new Error(`Exchange not supported: ${exchangeId}`)
    }

    this.#exchange = new ccxt[exchangeId](config)
    this.exchangeId = exchangeId
  }

  /** Fetch current ticker for a symbol */
  async getTicker(symbol = "BTC/USDT") {
    const ticker = await this.#exchange.fetchTicker(symbol)
    return {
      symbol,
      price: ticker.last,
      bid: ticker.bid,
      ask: ticker.ask,
      high24h: ticker.high,
      low24h: ticker.low,
      change24h: ticker.change,
      changePercent24h: ticker.percentage,
      volume24h: ticker.baseVolume,
      timestamp: ticker.timestamp,
    }
  }

  /**
   * Fetch OHLCV candles
   * @param {string} symbol
   * @param {"1m"|"5m"|"15m"|"1h"|"4h"|"1d"} timeframe
   * @param {number} limit  number of candles
   * @returns {Promise<Array<{timestamp,open,high,low,close,volume}>>}
   */
  async getCandles(symbol = "BTC/USDT", timeframe = "1h", limit = 100) {
    const raw = await this.#exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
    return raw.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }))
  }

  /** Fetch account balance */
  async getBalance() {
    const balance = await this.#exchange.fetchBalance()
    return {
      USDT: balance.free?.USDT ?? 0,
      BTC: balance.free?.BTC ?? 0,
      total: balance.total,
    }
  }

  /**
   * Place a market order
   * @param {"buy"|"sell"} side
   * @param {string} symbol
   * @param {number} quantity
   * @param {object} [params]
   */
  async placeMarketOrder(side, symbol, quantity, params = {}) {
    return this.#exchange.createMarketOrder(symbol, side, quantity, undefined, params)
  }

  /**
   * Place a limit order
   * @param {"buy"|"sell"} side
   * @param {string} symbol
   * @param {number} quantity
   * @param {number} price
   * @param {object} [params]
   */
  async placeLimitOrder(side, symbol, quantity, price, params = {}) {
    return this.#exchange.createLimitOrder(symbol, side, quantity, price, params)
  }

  /** Cancel an open order */
  async cancelOrder(orderId, symbol) {
    return this.#exchange.cancelOrder(orderId, symbol)
  }

  /** Fetch a single order by ID */
  async getOrder(orderId, symbol) {
    return this.#exchange.fetchOrder(orderId, symbol)
  }

  /** List open orders */
  async getOpenOrders(symbol) {
    return this.#exchange.fetchOpenOrders(symbol)
  }
}
