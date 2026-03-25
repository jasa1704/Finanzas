/**
 * OrderExecutor — places and tracks orders.
 *
 * Supports two modes:
 *   PAPER — simulates orders against live prices, no real money
 *   LIVE  — sends real orders to the exchange
 */
export class OrderExecutor {
  #client
  #logger
  #db
  #mode
  #userId

  /**
   * @param {{
   *   client: import("../exchange/ExchangeClient.js").ExchangeClient,
   *   logger: import("../logger/BotLogger.js").BotLogger,
   *   db: import("@prisma/client").PrismaClient,
   *   mode: "PAPER"|"LIVE",
   *   userId: string
   * }} deps
   */
  constructor({ client, logger, db, mode, userId }) {
    this.#client = client
    this.#logger = logger
    this.#db = db
    this.#mode = mode
    this.#userId = userId
  }

  /**
   * Open a new position.
   * @param {{
   *   symbol: string,
   *   side: "BUY"|"SELL",
   *   quantity: number,
   *   currentPrice: number,
   *   stopLoss: number,
   *   takeProfit: number,
   *   strategy: string
   * }} params
   */
  async openPosition(params) {
    const { symbol, side, quantity, currentPrice, stopLoss, takeProfit, strategy } = params

    let orderId = null

    if (this.#mode === "LIVE") {
      const order = await this.#client.placeMarketOrder(side.toLowerCase(), symbol, quantity)
      orderId = order.id
    } else {
      // Paper: generate a fake order ID
      orderId = `PAPER-${Date.now()}`
    }

    const position = await this.#db.position.create({
      data: {
        userId: this.#userId,
        symbol,
        side,
        entryPrice: currentPrice,
        quantity,
        stopLoss,
        takeProfit,
        orderId,
        strategy,
      },
    })

    const trade = await this.#db.trade.create({
      data: {
        userId: this.#userId,
        symbol,
        side,
        entryPrice: currentPrice,
        quantity,
        stopLoss,
        takeProfit,
        orderId,
        strategy,
        status: "OPEN",
        openedAt: new Date(),
      },
    })

    await this.#logger.order("POSITION_OPENED", `${side} ${quantity} ${symbol} @ ${currentPrice}`, {
      tradeId: trade.id,
      orderId,
      stopLoss,
      takeProfit,
      mode: this.#mode,
    })

    return { position, trade }
  }

  /**
   * Close an open position.
   * @param {{
   *   positionId: string,
   *   tradeId: string,
   *   currentPrice: number,
   *   reason: string
   * }} params
   */
  async closePosition({ positionId, tradeId, currentPrice, reason }) {
    const position = await this.#db.position.findUnique({ where: { id: positionId } })
    if (!position) throw new Error(`Position ${positionId} not found`)

    const entryPrice = parseFloat(position.entryPrice.toString())
    const quantity = parseFloat(position.quantity.toString())
    const pnlRaw = position.side === "BUY"
      ? (currentPrice - entryPrice) * quantity
      : (entryPrice - currentPrice) * quantity
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * (position.side === "BUY" ? 1 : -1)

    if (this.#mode === "LIVE") {
      const closeSide = position.side === "BUY" ? "sell" : "buy"
      await this.#client.placeMarketOrder(closeSide, position.symbol, quantity)
    }

    await this.#db.position.delete({ where: { id: positionId } })

    const trade = await this.#db.trade.update({
      where: { id: tradeId },
      data: {
        exitPrice: currentPrice,
        pnl: parseFloat(pnlRaw.toFixed(8)),
        pnlPercent: parseFloat(pnlPercent.toFixed(4)),
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    await this.#logger.order("POSITION_CLOSED", `Closed ${position.symbol} @ ${currentPrice} | PnL: ${pnlRaw.toFixed(2)} USDT`, {
      tradeId,
      entryPrice,
      exitPrice: currentPrice,
      pnl: pnlRaw,
      pnlPercent,
      reason,
      mode: this.#mode,
    })

    return trade
  }
}
