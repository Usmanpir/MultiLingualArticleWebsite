import type { Metadata } from "next"
import Link from "next/link"
import { ActionForm, SubmitButton } from "@/components/admin/client"
import { Field, PageHeader, StatusBadge } from "@/components/admin/ui"
import { saveStaticPageAction } from "@/lib/actions/admin/content"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { staticPageKeys } from "@/lib/urls"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Pages" }

export default async function PagesAdmin({ searchParams }: PageProps<"/admin/pages">) {
  await requirePageUser("pages.manage")
  const sp = await searchParams
  const key = (staticPageKeys as readonly string[]).includes(String(sp.key)) ? String(sp.key) : staticPageKeys[0]
  const [languages, page] = await Promise.all([
    prisma.language.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.staticPage.findUnique({ where: { key }, include: { translations: true } }),
  ])
  return (
    <>
      <PageHeader title="Pages" description="About, contact and policy pages. Content is HTML (sanitised on save). Review legal pages with a qualified professional before launch." />
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Pages">
        {staticPageKeys.map((k) => (
          <Link key={k} href={`/admin/pages?key=${k}`} aria-current={k === key ? "page" : undefined} className={cn("btn btn-sm", k === key ? "btn-primary" : "btn-ghost")}>
            {k}
          </Link>
        ))}
      </nav>
      <div className="grid gap-6">
        {languages.map((l) => {
          const tr = page?.translations.find((t) => t.languageId === l.id)
          const dir = l.direction === "RTL" ? "rtl" : "ltr"
          return (
            <details key={`${key}-${l.id}`} className="card" open={l.isDefault}>
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <span className="font-semibold">{l.name}</span>
                <StatusBadge status={tr ? "PUBLISHED" : "MISSING"}>{tr ? "live" : "missing"}</StatusBadge>
                {tr && (
                  <a href={`/${l.code}/${key}`} target="_blank" className="ms-auto text-sm text-accent hover:underline">
                    View ↗
                  </a>
                )}
              </summary>
              <ActionForm action={saveStaticPageAction} className="grid gap-3 border-t border-border p-4">
                <input type="hidden" name="key" value={key} />
                <input type="hidden" name="languageId" value={l.id} />
                <Field label="Title" htmlFor={`pt-${l.id}`}>
                  <input id={`pt-${l.id}`} name="title" defaultValue={tr?.title} required className="input" dir={dir} lang={l.code} />
                </Field>
                <Field label="Meta description" htmlFor={`pd-${l.id}`}>
                  <textarea id={`pd-${l.id}`} name="seoDescription" defaultValue={tr?.seoDescription} required minLength={20} maxLength={170} rows={2} className="input" dir={dir} lang={l.code} />
                </Field>
                <Field label="Content (HTML)" htmlFor={`pc-${l.id}`}>
                  <textarea id={`pc-${l.id}`} name="content" defaultValue={tr?.content} required rows={16} className="input font-mono text-sm" dir={dir} lang={l.code} />
                </Field>
                <div>
                  <SubmitButton className="btn-sm">Save {l.name}</SubmitButton>
                </div>
              </ActionForm>
            </details>
          )
        })}
      </div>
    </>
  )
}
