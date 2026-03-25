import { createWriteStream, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGS_DIR = join(__dirname, "../../logs")

// Ensure logs directory exists
mkdirSync(LOGS_DIR, { recursive: true })

/**
 * BotLogger — immutable append-only log system.
 * Writes simultaneously to:
 *   1. logs/bot-YYYY-MM-DD.log  (flat file, one JSON per line)
 *   2. PostgreSQL BotLog table  (via Prisma)
 *
 * Records are NEVER updated, only inserted.
 */
export class BotLogger {
  #userId
  #db
  #stream

  /**
   * @param {string} userId
   * @param {import("@prisma/client").PrismaClient} db
   */
  constructor(userId, db) {
    this.#userId = userId
    this.#db = db

    const date = new Date().toISOString().slice(0, 10)
    const filePath = join(LOGS_DIR, `bot-${date}.log`)
    this.#stream = createWriteStream(filePath, { flags: "a" })
  }

  /** @param {string} event  @param {string} message  @param {object} [metadata] */
  async info(event, message, metadata) {
    return this.#write("INFO", event, message, metadata)
  }

  async warn(event, message, metadata) {
    return this.#write("WARN", event, message, metadata)
  }

  async error(event, message, metadata) {
    return this.#write("ERROR", event, message, metadata)
  }

  async signal(event, message, metadata) {
    return this.#write("SIGNAL", event, message, metadata)
  }

  async order(event, message, metadata) {
    return this.#write("ORDER", event, message, metadata)
  }

  async #write(level, event, message, metadata) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      event,
      message,
      ...(metadata && { metadata }),
    }

    // 1. Write to file (sync append via stream)
    this.#stream.write(JSON.stringify(entry) + "\n")

    // 2. Write to database (immutable insert only)
    try {
      await this.#db.botLog.create({
        data: {
          userId: this.#userId,
          level,
          event,
          message,
          metadata: metadata ?? undefined,
        },
      })
    } catch (err) {
      // File log already written — DB failure is non-fatal
      this.#stream.write(
        JSON.stringify({ ts: new Date().toISOString(), level: "ERROR", event: "DB_LOG_FAIL", message: err.message }) + "\n"
      )
    }
  }

  close() {
    this.#stream.end()
  }
}
