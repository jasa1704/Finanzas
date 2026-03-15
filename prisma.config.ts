import { defineConfig } from "prisma/config"
import path from "node:path"
import { config } from "dotenv"

config({ path: ".env" })

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
