"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "../../prisma"
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "../../auth/session"
import { clientFingerprint, rateLimit } from "../../rate-limit"
import { logActivity } from "../../services/activity"
import type { ActionResult } from "./helpers"

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
})

// Used to keep timing similar whether or not the account exists.
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO4xb1X2bE4b4n4Y2m9oG3y1Qe9m8r0rS"

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") || undefined })
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." }
  const { email, password, next } = parsed.data

  const fp = await clientFingerprint()
  const [byIp, byAccount] = await Promise.all([rateLimit(`login:ip:${fp}`, 20, 900), rateLimit(`login:acct:${email}`, 8, 900)])
  if (!byIp.ok || !byAccount.ok) return { ok: false, message: "Too many sign-in attempts. Please wait 15 minutes and try again." }

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } })
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid || !user.isActive) return { ok: false, message: "Incorrect email or password." }

  await createSession({ id: user.id, role: user.role.name, sessionVersion: user.sessionVersion })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await logActivity(user.id, "auth.login", "User", user.id, `${user.name} signed in`)
  redirect(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

const passwordSchema = z
  .object({ current: z.string().min(1), next: z.string().min(12, "Use at least 12 characters").max(200), confirm: z.string() })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" })

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const me = await getCurrentUser()
  if (!me) return { ok: false, message: "Please sign in again." }
  const parsed = passwordSchema.safeParse({ current: formData.get("current"), next: formData.get("next"), confirm: formData.get("confirm") })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id }, include: { role: true } })
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return { ok: false, message: "Current password is incorrect." }
  // Bumping sessionVersion signs out every other session.
  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(parsed.data.next), sessionVersion: { increment: 1 } },
  })
  await createSession({ id: updated.id, role: user.role.name, sessionVersion: updated.sessionVersion })
  await logActivity(me.id, "auth.password", "User", me.id, "Changed password")
  return { ok: true, message: "Password updated. Other sessions were signed out." }
}
