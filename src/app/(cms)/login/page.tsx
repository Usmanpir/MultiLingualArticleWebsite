import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LogoMark } from "@/components/brand/Logo"
import { LoginForm } from "@/components/admin/LoginForm"
import { getCurrentUser } from "@/lib/auth/session"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/admin")
  const sp = await searchParams
  const next = typeof sp.next === "string" ? sp.next : "/admin"
  const settings = await getSettings()
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="aurora pointer-events-none absolute -inset-x-20 -top-40 h-[30rem]" aria-hidden />
      <div className="glow-border card relative w-full max-w-sm p-8">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display text-lg font-bold">{settings.siteName}</span>
        </div>
        <h1 className="font-display mt-6 text-2xl font-bold">Sign in to the newsroom</h1>
        <p className="mt-1 text-sm text-fg-muted">Editors, authors and administrators only.</p>
        <LoginForm next={next} />
      </div>
    </main>
  )
}
