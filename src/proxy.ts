import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isLocale } from "@/lib/i18n/config"
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token"

function preferredLocale(req: NextRequest) {
  const header = req.headers.get("accept-language") || ""
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=")
      return { lang: (tag || "").toLowerCase().split("-")[0], q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return ranked.find((r) => isLocale(r.lang))?.lang ?? defaultLocale
}

/**
 * Runs before routing. Keep it fast: no database access here.
 *  - `/admin/*`: optimistic session check (pages/actions re-verify against the DB).
 *  - `/`: send readers to their preferred language.
 *  - other un-prefixed paths: prefix the default locale.
 *  - store Vercel's geo country in a cookie for the consent banner.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)
    if (!session) {
      const url = new URL("/login", req.url)
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }
  if (pathname === "/login") {
    const res = NextResponse.next()
    res.headers.set("X-Robots-Tag", "noindex, nofollow")
    return res
  }

  const first = pathname.split("/")[1]
  if (!isLocale(first)) {
    const target = pathname === "/" ? preferredLocale(req) : defaultLocale
    const url = new URL(`/${target}${pathname === "/" ? "" : pathname}${search}`, req.url)
    // `/` varies by visitor, so it must be temporary; legacy un-prefixed paths are permanent.
    const res = NextResponse.redirect(url, pathname === "/" ? 307 : 308)
    if (pathname === "/") res.headers.set("Vary", "Accept-Language")
    return res
  }

  const res = NextResponse.next()
  const country = req.headers.get("x-vercel-ip-country")
  if (country && req.cookies.get("fs_country")?.value !== country) {
    res.cookies.set("fs_country", country, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })
  }
  return res
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes, sitemaps and files with an extension.
    "/((?!_next/|api/|sitemaps/|.*\\..*).*)",
  ],
}
