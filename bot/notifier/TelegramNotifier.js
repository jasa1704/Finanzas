/**
 * TelegramNotifier — sends alerts via Telegram Bot API.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 *
 * Uses plain fetch (no extra dependency) to keep it lightweight.
 */
export class TelegramNotifier {
  #token
  #chatId
  #enabled

  constructor() {
    this.#token = process.env.TELEGRAM_BOT_TOKEN
    this.#chatId = process.env.TELEGRAM_CHAT_ID
    this.#enabled = Boolean(this.#token && this.#chatId)
  }

  get isEnabled() {
    return this.#enabled
  }

  /** @param {string} message  Markdown-formatted text */
  async send(message) {
    if (!this.#enabled) return

    const url = `https://api.telegram.org/bot${this.#token}/sendMessage`
    const body = {
      chat_id: this.#chatId,
      text: message,
      parse_mode: "Markdown",
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.text()
        console.error("[TelegramNotifier] Failed to send:", err)
      }
    } catch (err) {
      console.error("[TelegramNotifier] Network error:", err.message)
    }
  }

  async tradeOpened({ symbol, side, price, quantity, stopLoss, takeProfit, mode }) {
    const emoji = side === "BUY" ? "🟢" : "🔴"
    const modeTag = mode === "PAPER" ? "📄 PAPER" : "⚡ LIVE"
    await this.send(
      `${emoji} *${side} ${symbol}* [${modeTag}]\n` +
      `Entry: \`${price}\`\n` +
      `Qty: \`${quantity}\`\n` +
      `SL: \`${stopLoss}\`  TP: \`${takeProfit}\``
    )
  }

  async tradeClosed({ symbol, side, entryPrice, exitPrice, pnl, pnlPercent, mode }) {
    const emoji = pnl >= 0 ? "✅" : "❌"
    const sign = pnl >= 0 ? "+" : ""
    const modeTag = mode === "PAPER" ? "📄 PAPER" : "⚡ LIVE"
    await this.send(
      `${emoji} *CLOSED ${symbol}* [${modeTag}]\n` +
      `Entry: \`${entryPrice}\` → Exit: \`${exitPrice}\`\n` +
      `PnL: \`${sign}${pnl.toFixed(2)} USDT (${sign}${pnlPercent.toFixed(2)}%)\``
    )
  }

  async botPaused(reason) {
    await this.send(`⚠️ *Bot paused*\n\`${reason}\``)
  }

  async botStarted(mode, symbol) {
    await this.send(`🤖 *Bot started* [${mode}]\nTrading: \`${symbol}\``)
  }
}
