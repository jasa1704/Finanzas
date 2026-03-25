import { auth } from "@/lib/auth"
import type { PriceUpdate } from "@/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/bot/price
 * Server-Sent Events stream of BTC/USDT live price via ccxt REST polling.
 * Sends a "tick" event every ~3 seconds.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const symbol = process.env.BOT_SYMBOL ?? "BTC/USDT"
  const exchange = process.env.BOT_EXCHANGE ?? "binance"

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(event: string, data: unknown) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      // Dynamically import ccxt to avoid bundling issues in edge
      let ccxtExchange: any
      try {
        const ccxt = await import("ccxt")
        const ExchangeClass = (ccxt as any)[exchange] ?? (ccxt as any).binance
        ccxtExchange = new ExchangeClass({ enableRateLimit: true })
      } catch {
        send("error", { message: "Exchange unavailable" })
        controller.close()
        return
      }

      let active = true

      async function poll() {
        while (active) {
          try {
            const ticker = await ccxtExchange.fetchTicker(symbol)
            const update: PriceUpdate = {
              symbol,
              price: ticker.last ?? 0,
              change24h: ticker.change ?? 0,
              changePercent24h: ticker.percentage ?? 0,
              high24h: ticker.high ?? 0,
              low24h: ticker.low ?? 0,
              timestamp: ticker.timestamp ?? Date.now(),
            }
            send("tick", update)
          } catch {
            // Non-fatal: skip this tick
          }

          // Wait 3 seconds between polls
          await new Promise((r) => setTimeout(r, 3000))
        }
      }

      poll()

      // Cleanup when client disconnects
      return () => {
        active = false
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
