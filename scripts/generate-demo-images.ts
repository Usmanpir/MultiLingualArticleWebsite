/**
 * Generates original abstract artwork for demo articles plus brand assets.
 * Output is committed to /public so seeding a remote database works without
 * uploads. Run: npm run demo:images
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"
import { articles } from "../prisma/seed-content"
import { CATEGORY_COLORS } from "../prisma/seed-data"

const OUT = join(process.cwd(), "public", "images")
const W = 1600
const H = 900

function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function artwork(key: string, color: string) {
  const r = rng(key)
  const accent2 = ["#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"][Math.floor(r() * 5)]
  const orbs = Array.from({ length: 3 }, (_, i) => {
    const cx = Math.round(r() * W)
    const cy = Math.round(r() * H)
    const rad = Math.round(220 + r() * 360)
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${i % 2 ? accent2 : color}" opacity="${(0.22 + r() * 0.25).toFixed(2)}" filter="url(#blur)"/>`
  }).join("")
  const rings = Array.from({ length: 4 }, () => {
    const cx = Math.round(W * (0.3 + r() * 0.4))
    const cy = Math.round(H * (0.3 + r() * 0.4))
    const rx = Math.round(180 + r() * 520)
    const ry = Math.round(rx * (0.2 + r() * 0.35))
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-opacity="${(0.25 + r() * 0.4).toFixed(2)}" stroke-width="${(1 + r() * 2).toFixed(1)}" transform="rotate(${Math.round(-35 + r() * 70)} ${cx} ${cy})"/>`
  }).join("")
  const dots = Array.from({ length: 70 }, () => `<circle cx="${Math.round(r() * W)}" cy="${Math.round(r() * H)}" r="${(0.8 + r() * 2.2).toFixed(1)}" fill="#e7ebf3" opacity="${(0.2 + r() * 0.6).toFixed(2)}"/>`).join("")
  const sphereX = Math.round(W * (0.55 + r() * 0.25))
  const sphereY = Math.round(H * (0.35 + r() * 0.3))
  const sphereR = Math.round(140 + r() * 120)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070a12"/><stop offset="0.6" stop-color="#0b1a2e"/><stop offset="1" stop-color="#150f30"/></linearGradient>
    <radialGradient id="sphere" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="0.25" stop-color="${color}" stop-opacity="0.85"/><stop offset="1" stop-color="#070a12" stop-opacity="0.2"/></radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#94a3b8" stroke-opacity="0.08"/></pattern>
    <filter id="blur"><feGaussianBlur stdDeviation="90"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  ${orbs}
  <rect width="100%" height="100%" fill="url(#grid)"/>
  ${rings}
  <circle cx="${sphereX}" cy="${sphereY}" r="${sphereR}" fill="url(#sphere)"/>
  ${dots}
</svg>`
}

async function main() {
  await mkdir(join(OUT, "demo"), { recursive: true })
  for (const a of articles) {
    const svg = artwork(a.key, CATEGORY_COLORS[a.category])
    await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(join(OUT, "demo", `${a.key}.webp`))
    console.log("image", a.key)
  }

  // Author avatars (abstract, not faces — demo authors are fictional).
  for (const [key, color] of [["amara", "#22d3ee"], ["daniel", "#a78bfa"], ["layla", "#34d399"]] as const) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><rect width="256" height="256" fill="url(#g)"/><circle cx="128" cy="104" r="44" fill="#e7ebf3" opacity=".85"/><path d="M48 236c10-50 44-76 80-76s70 26 80 76" fill="#e7ebf3" opacity=".85"/></svg>`
    await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(join(OUT, "demo", `avatar-${key}.webp`))
  }

  const mark = (size: number, bg = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
    ${bg ? '<rect width="32" height="32" rx="7" fill="#070a12"/>' : ""}
    <circle cx="16" cy="16" r="8" fill="none" stroke="url(#g)" stroke-width="2.4"/>
    <ellipse cx="16" cy="16" rx="13" ry="4.6" fill="none" stroke="url(#g)" stroke-width="1.3" transform="rotate(-24 16 16)"/>
    <circle cx="25.6" cy="11.2" r="1.7" fill="#22d3ee"/></svg>`
  await sharp(Buffer.from(mark(512))).png().toFile(join(OUT, "logo-512.png"))
  await sharp(Buffer.from(mark(180))).png().toFile(join(process.cwd(), "src", "app", "apple-icon.png"))
  await writeFile(join(process.cwd(), "src", "app", "icon.svg"), mark(32))

  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070a12"/><stop offset=".6" stop-color="#0b1a2e"/><stop offset="1" stop-color="#1a1038"/></linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#94a3b8" stroke-opacity=".08"/></pattern></defs>
    <rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grid)"/>
    <g transform="translate(96 220) scale(5)">${mark(32, false).replace(/<\/?svg[^>]*>/g, "")}</g>
    <text x="290" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="84" font-weight="700" fill="#e7ebf3">FutureSphere</text>
    <text x="294" y="360" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" fill="#a3adc2">Explore Technology. Understand Tomorrow.</text>
  </svg>`
  await sharp(Buffer.from(og)).png().toFile(join(OUT, "og-default.png"))
  console.log("brand assets written")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
