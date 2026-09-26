import type { NextConfig } from "next"

/**
 * Hosts allowed for next/image remote sources. Vercel Blob is included for
 * uploads; add CDN/hosts via MEDIA_REMOTE_HOSTS="cdn.example.com,images.example.org".
 */
const remoteHosts = (process.env.MEDIA_REMOTE_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ...remoteHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
  },
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ["lucide-react"],
    serverActions: { bodySizeLimit: "2mb" },
  },
  // The OG image route reads bundled font files at runtime.
  outputFileTracingIncludes: {
    "/api/og/[id]": ["./src/assets/fonts/**"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ]
  },
}

export default nextConfig
