import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { ExchangeClient } from "../exchange/ExchangeClient.js"
import { PriceFeed } from "../data/PriceFeed.js"
import { HistoricalData } from "../data/HistoricalData.js"
import { EMACrossStrategy } from "../strategy/EMACrossStrategy.js"
import { RiskManager } from "../risk/RiskManager.js"
import { OrderExecutor } from "../executor/OrderExecutor.js"
import { BotLogger } from "../logger/BotLogger.js"
import { TelegramNotifier } from "../notifier/TelegramNotifier.js"

const STRATEGY_MAP = {
  EMA_CROSS: () => new EMACrossStrategy(9, 21),
}

/**
 * BotEngine — main orchestrator.
 *
 * On each price tick:
 *   1. Fetch latest candles
 *   2. Evaluate strategy → signal
 *   3. Check risk rules → approved?
 *   4. Execute order (paper or live)
 *   5. Check open positions for SL/TP hits
 *   6. Log everything
 */
export class BotEngine {
  #db
  #exchange
  #priceFeed
  #historicalData
  #strategy
  #riskManager
  #executor
  #logger
  #notifier
  #config
  #openPositions = []
  #dailyPnl = 0
  #totalPnl = 0

  constructor(config) {
    this.#config = config
    this.#notifier = new TelegramNotifier()

    // Prisma
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    this.#db = new PrismaClient({ adapter })

    // Exchange
    this.#exchange = new ExchangeClient(config.exchange)

    // Data
    this.#priceFeed = new PriceFeed(this.#exchange, config.symbol, 5000)
    this.#historicalData = new HistoricalData(this.#exchange)

    // Strategy
    const strategyFactory = STRATEGY_MAP[config.strategy] ?? STRATEGY_MAP.EMA_CROSS
    this.#strategy = strategyFactory()

    // Risk
    this.#riskManager = new RiskManager({
      capitalPercent: Number(config.capitalPercent),
      maxDrawdown: Number(config.maxDrawdown),
      maxDailyLoss: Number(config.maxDailyLoss),
    })

    // Logger
    this.#logger = new BotLogger(config.userId, this.#db)

    // Executor
    this.#executor = new OrderExecutor({
      client: this.#exchange,
      logger: this.#logger,
      db: this.#db,
      mode: config.mode,
      userId: config.userId,
    })
  }

  async start() {
    await this.#logger.info("BOT_START", `Bot starting — ${this.#config.symbol} [${this.#config.mode}]`)
    await this.#notifier.botStarted(this.#config.mode, this.#config.symbol)

    // Load open positions from DB
    this.#openPositions = await this.#db.position.findMany({
      where: { userId: this.#config.userId },
    })

    this.#priceFeed.on("tick", (tick) => this.#onTick(tick))
    this.#priceFeed.on("error", (err) => this.#logger.error("FEED_ERROR", err.message))

    await this.#priceFeed.start()

    // Mark bot as active in DB
    await this.#db.botConfig.update({
      where: { userId: this.#config.userId },
      data: { isActive: true },
    })
  }

  async stop(reason = "Manual stop") {
    this.#priceFeed.stop()
    await this.#logger.info("BOT_STOP", reason)
    await this.#db.botConfig.update({
      where: { userId: this.#config.userId },
      data: { isActive: false },
    })
    this.#logger.close()
    await this.#db.$disconnect()
  }

  async #onTick(tick) {
    const { price } = tick
    const candles = await this.#historicalData.getCandles(this.#config.symbol, "1h", 100)

    // ── 1. Check circuit breakers ──────────────────────────
    const circuit = this.#riskManager.checkCircuitBreaker({
      dailyPnl: this.#dailyPnl,
      totalPnl: this.#totalPnl,
      capital: this.#config.capital ?? 1000,
    })

    if (circuit.shouldPause) {
      await this.#logger.warn("CIRCUIT_BREAKER", circuit.reason)
      await this.#notifier.botPaused(circuit.reason)
      await this.stop(circuit.reason)
      return
    }

    // ── 2. Check open positions for SL/TP hits ─────────────
    for (const pos of [...this.#openPositions]) {
      await this.#checkStopLossTakeProfit(pos, price)
    }

    // ── 3. Evaluate strategy signal ────────────────────────
    const signal = this.#strategy.evaluate(candles)

    await this.#logger.signal("SIGNAL", signal.reason, {
      type: signal.type,
      confidence: signal.confidence,
      price,
    })

    if (signal.type === "HOLD") return

    // ── 4. Risk validation ─────────────────────────────────
    const risk = this.#riskManager.validate({
      signal,
      currentPrice: price,
      candles,
      totalCapital: this.#config.capital ?? 1000,
      openPositions: this.#openPositions.length,
    })

    if (!risk.approved) {
      await this.#logger.warn("RISK_REJECTED", risk.reason, { signal: signal.type })
      return
    }

    // ── 5. Execute order ───────────────────────────────────
    const { position } = await this.#executor.openPosition({
      symbol: this.#config.symbol,
      side: signal.type,
      quantity: risk.size,
      currentPrice: price,
      stopLoss: risk.stopLoss,
      takeProfit: risk.takeProfit,
      strategy: this.#strategy.name,
    })

    this.#openPositions.push(position)

    await this.#notifier.tradeOpened({
      symbol: this.#config.symbol,
      side: signal.type,
      price,
      quantity: risk.size,
      stopLoss: risk.stopLoss,
      takeProfit: risk.takeProfit,
      mode: this.#config.mode,
    })
  }

  async #checkStopLossTakeProfit(position, currentPrice) {
    const entry = parseFloat(position.entryPrice.toString())
    const sl = position.stopLoss ? parseFloat(position.stopLoss.toString()) : null
    const tp = position.takeProfit ? parseFloat(position.takeProfit.toString()) : null

    let shouldClose = false
    let closeReason = ""

    if (position.side === "BUY") {
      if (sl && currentPrice <= sl) { shouldClose = true; closeReason = "Stop loss hit" }
      if (tp && currentPrice >= tp) { shouldClose = true; closeReason = "Take profit hit" }
    } else {
      if (sl && currentPrice >= sl) { shouldClose = true; closeReason = "Stop loss hit" }
      if (tp && currentPrice <= tp) { shouldClose = true; closeReason = "Take profit hit" }
    }

    if (!shouldClose) return

    // Find the associated open trade
    const trade = await this.#db.trade.findFirst({
      where: { userId: this.#config.userId, status: "OPEN", orderId: position.orderId },
    })
    if (!trade) return

    const closedTrade = await this.#executor.closePosition({
      positionId: position.id,
      tradeId: trade.id,
      currentPrice,
      reason: closeReason,
    })

    const pnl = parseFloat(closedTrade.pnl?.toString() ?? "0")
    const pnlPct = parseFloat(closedTrade.pnlPercent?.toString() ?? "0")
    this.#dailyPnl += pnl
    this.#totalPnl += pnl

    // Remove from local state
    this.#openPositions = this.#openPositions.filter((p) => p.id !== position.id)

    await this.#notifier.tradeClosed({
      symbol: position.symbol,
      side: position.side,
      entryPrice: entry,
      exitPrice: currentPrice,
      pnl,
      pnlPercent: pnlPct,
      mode: this.#config.mode,
    })
  }
}
