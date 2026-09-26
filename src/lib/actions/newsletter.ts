"use server"

import { redirect } from "next/navigation"
import { prisma } from "../prisma"
import { isLocale } from "../i18n/config"

export async function unsubscribeNewsletter(formData: FormData) {
  const token = String(formData.get("token") || "")
  const langRaw = String(formData.get("lang") || "en")
  const lang = isLocale(langRaw) ? langRaw : "en"
  if (!/^[a-f0-9]{48}$/.test(token)) redirect(`/${lang}/newsletter/unsubscribe?invalid=1`)
  const res = await prisma.newsletterSubscriber.updateMany({
    where: { unsubscribeToken: token, status: "SUBSCRIBED" },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  })
  redirect(`/${lang}/newsletter/unsubscribe?${res.count ? "done=1" : "invalid=1"}`)
}
