/**
 * Central brand configuration.
 *
 * Change the publication's identity here. Values that editors may want to
 * change without a deploy (SEO title, verification codes, default OG image…)
 * can also be overridden at runtime in Admin → Settings, which takes
 * precedence over these defaults.
 */
export const brandConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "FutureSphere",
  shortName: "FutureSphere",
  /** Localised taglines — keyed by language code. */
  tagline: {
    en: "Explore Technology. Understand Tomorrow.",
    ur: "ٹیکنالوجی کو دریافت کریں۔ کل کو سمجھیں۔",
    ar: "استكشف التقنية. افهم الغد.",
  } as Record<string, string>,
  description: {
    en: "An independent digital publication on technology, artificial intelligence, science and the ideas shaping tomorrow.",
    ur: "ٹیکنالوجی، مصنوعی ذہانت، سائنس اور مستقبل کی تشکیل کرنے والے خیالات پر ایک آزاد ڈیجیٹل جریدہ۔",
    ar: "منصة رقمية مستقلة تغطي التقنية والذكاء الاصطناعي والعلوم والأفكار التي تصنع المستقبل.",
  } as Record<string, string>,
  /** Logo: `mark` is rendered as an inline SVG; set `image` to a /public path to use a file instead. */
  logo: {
    image: null as string | null,
    alt: "FutureSphere logo",
  },
  favicon: "/favicon.ico",
  themeColor: { light: "#f7f8fb", dark: "#070a12" },
  defaultOgImage: "/images/og-default.png",
  organization: {
    name: "FutureSphere Media",
    legalName: "FutureSphere Media",
    logo: "/images/logo-512.png",
    foundingYear: 2026,
  },
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
    editorialEmail: process.env.NEXT_PUBLIC_EDITORIAL_EMAIL || "editors@example.com",
  },
  /** Leave a value empty to hide that network. Use full profile URLs. */
  social: {
    x: "",
    xHandle: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    instagram: "",
  },
} as const

export function brandTagline(lang: string) {
  return brandConfig.tagline[lang] ?? brandConfig.tagline.en
}

export function brandDescription(lang: string) {
  return brandConfig.description[lang] ?? brandConfig.description.en
}
