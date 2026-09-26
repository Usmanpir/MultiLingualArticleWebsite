import "server-only"
import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { prisma } from "./prisma"

/**
 * Fixed-window rate limiter stored in Postgres, so it works across serverless
 * instances without extra infrastructure. One atomic upsert per check.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN NOW() + make_interval(secs => ${windowSeconds}) ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`
  const row = rows[0]!
  return { ok: row.count <= limit, remaining: Math.max(0, limit - row.count), resetAt: row.resetAt }
}

/** Salted, truncated hash of the client IP — raw IPs are never stored. */
export async function clientFingerprint(extra = "") {
  const h = await headers()
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim()
  const salt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev"
  return createHash("sha256").update(`${salt}:${ip}:${extra}`).digest("hex").slice(0, 32)
}
