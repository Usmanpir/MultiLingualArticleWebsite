import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Inter, JetBrains_Mono, Noto_Nastaliq_Urdu, Noto_Sans_Arabic, Space_Grotesk } from "next/font/google"
import "../globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { CookieConsent } from "@/components/consent/CookieConsent"
import { Analytics } from "@/components/analytics/Analytics"
import { brandConfig } from "@/lib/brand"
import { bootScript } from "@/lib/boot-script"
import { getActiveLanguages, getNavCategories } from "@/lib/data/public"
import { publicEnv, siteUrl } from "@/lib/env"
import { getDictionary, isLocale, localeMeta, locales } from "@/lib/i18n"
import { getSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap", weight: ["500", "600", "700"] })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"], preload: false })
// Arabic-script faces are not preloaded: browsers fetch them only on ur/ar pages where glyphs are used.
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic", display: "swap", weight: ["400", "500", "600", "700"], preload: false })
const notoUrdu = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-noto-urdu", display: "swap", weight: ["400", "600"], preload: false })

// Note: no `dynamicParams = false` here — it would be inherited by every child
// segment and 404 all on-demand (ISR) articles/archives. Unknown locales are
// rejected below with notFound().
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brandConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: brandConfig.themeColor.dark },
  ],
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params
  const settings = await getSettings()
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    applicationName: settings.siteName,
    publisher: settings.organizationName,
    formatDetection: { telephone: false, email: false, address: false },
    verification: {
      google: settings.googleVerification || undefined,
      other: settings.bingVerification ? { "msvalidate.01": settings.bingVerification } : undefined,
    },
    other: { "content-language": lang },
  }
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const meta = localeMeta[lang]
  const dict = getDictionary(lang)
  const [settings, categories, languages] = await Promise.all([getSettings(), getNavCategories(lang), getActiveLanguages()])
  const languageOptions = languages
    .filter((l) => isLocale(l.code))
    .map((l) => ({ code: l.code, nativeName: l.nativeName, dir: l.direction === "RTL" ? ("rtl" as const) : ("ltr" as const) }))

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      suppressHydrationWarning
      className={cn(inter.variable, grotesk.variable, mono.variable, notoArabic.variable, notoUrdu.variable, "antialiased")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript(publicEnv.consentRegions) }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
          {dict.nav.skipToContent}
        </a>
        <SiteHeader lang={lang} dir={meta.dir} siteName={settings.siteName} dict={dict} categories={categories} languages={languageOptions} />
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter lang={lang} siteName={settings.siteName} dict={dict} categories={categories} newsletterEnabled={settings.newsletterEnabled} />
        <CookieConsent labels={dict.consent} policyHref={`/${lang}/cookie-policy`} />
        <Analytics measurementId={publicEnv.gaMeasurementId} lang={lang} />
      </body>
    </html>
  )
}
