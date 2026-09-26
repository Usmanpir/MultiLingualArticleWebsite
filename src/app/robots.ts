import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/env"

// Search result pages are intentionally NOT disallowed: they carry `noindex, follow`,
// which crawlers can only see if they're allowed to fetch the page.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_NOINDEX === "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og/"],
        disallow: ["/admin/", "/api/", "/api/private/", "/login", "/register"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
