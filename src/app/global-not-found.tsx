import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: true },
}

// Used for URLs that match no route at all (the app has separate root layouts for the site and admin).
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div>
          <p className="text-gradient text-8xl font-bold">404</p>
          <h1 className="mt-4 text-2xl font-bold">This page drifted out of orbit</h1>
          <p className="mt-2 text-fg-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rendered outside the router; a full load is intended */}
          <a href="/" className="btn btn-primary mt-8">
            Back to the homepage
          </a>
        </div>
      </body>
    </html>
  )
}
