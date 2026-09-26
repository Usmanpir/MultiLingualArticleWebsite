import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Noto_Sans_Arabic, Space_Grotesk } from "next/font/google"
import "../globals.css"
import { bootScript } from "@/lib/boot-script"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap", weight: ["500", "600", "700"] })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false })
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic", display: "swap", preload: false })

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
}

export default function CmsRootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cn(inter.variable, grotesk.variable, mono.variable, notoArabic.variable, "antialiased")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript("none") }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
