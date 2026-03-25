import { EventEmitter } from "events"

/**
 * PriceFeed — polls the exchange for the latest ticker on a fixed interval.
 * Emits "tick" events with the latest price data.
 *
 * Usage:
 *   const feed = new PriceFeed(exchangeClient, "BTC/USDT", 3000)
 *   feed.on("tick", (data) => console.log(data))
 *   feed.start()
 */
export class PriceFeed extends EventEmitter {
  #client
  #symbol
  #interval
  #timer = null
  #lastTick = null

  /**
   * @param {import("../exchange/ExchangeClient.js").ExchangeClient} client
   * @param {string} symbol
   * @param {number} intervalMs  polling interval in milliseconds (default 3s)
   */
  constructor(client, symbol = "BTC/USDT", intervalMs = 3000) {
    super()
    this.#client = client
    this.#symbol = symbol
    this.#interval = intervalMs
  }

  get lastTick() {
    return this.#lastTick
  }

  get isRunning() {
    return this.#timer !== null
  }

  async start() {
    if (this.#timer) return
    // Fetch immediately, then on interval
    await this.#poll()
    this.#timer = setInterval(() => this.#poll(), this.#interval)
  }

  stop() {
    if (this.#timer) {
      clearInterval(this.#timer)
      this.#timer = null
    }
    this.emit("stopped")
  }

  async #poll() {
    try {
      const tick = await this.#client.getTicker(this.#symbol)
      this.#lastTick = tick
      this.emit("tick", tick)
    } catch (err) {
      this.emit("error", err)
    }
  }
}
