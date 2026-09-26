import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL (non-pooled) is preferred for migrations when your provider offers one.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
})
