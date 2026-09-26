import type { Metadata } from "next"
import { ActionForm, SubmitButton } from "@/components/admin/client"
import { Check, Field, PageHeader, StatusBadge } from "@/components/admin/ui"
import { saveLanguageAction } from "@/lib/actions/admin/content"
import { requirePageUser } from "@/lib/auth/session"
import { locales } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Languages" }

export default async function LanguagesPage() {
  await requirePageUser("languages.manage")
  const languages = await prisma.language.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articleTranslations: true, categoryTranslations: true } } },
  })
  return (
    <>
      <PageHeader title="Languages" description="Enable, rename or reorder languages. Deactivating a language hides its pages and removes it from hreflang and sitemaps." />
      <div className="card mb-6 p-4 text-sm text-fg-muted">
        <strong className="text-fg">Adding a new language</strong> requires a small code change so the router and interface strings know about it: add the code to{" "}
        <code className="font-mono">src/lib/i18n/config.ts</code>, add a dictionary in <code className="font-mono">src/lib/i18n/dictionaries/</code>, then create the language row (see README). Currently routed:{" "}
        <span className="font-mono">{locales.join(", ")}</span>.
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {languages.map((l) => (
          <ActionForm key={l.id} action={saveLanguageAction} className="card grid gap-3 p-5">
            <input type="hidden" name="id" value={l.id} />
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {l.name} <span className="font-mono text-xs text-fg-subtle">/{l.code}</span>
              </h2>
              <div className="flex gap-1">
                {l.isDefault && <StatusBadge status="SCHEDULED">default</StatusBadge>}
                <StatusBadge status={l.isActive ? "ACTIVE" : "INACTIVE"} />
              </div>
            </div>
            <p className="text-xs text-fg-subtle">
              {l.direction} · {l._count.articleTranslations} article translations · {l._count.categoryTranslations} categories
              {!(locales as readonly string[]).includes(l.code) && " · not routed (add to i18n config)"}
            </p>
            <Field label="English name" htmlFor={`ln-${l.id}`}>
              <input id={`ln-${l.id}`} name="name" defaultValue={l.name} required className="input" />
            </Field>
            <Field label="Native name" htmlFor={`lnn-${l.id}`}>
              <input id={`lnn-${l.id}`} name="nativeName" defaultValue={l.nativeName} required className="input" dir={l.direction === "RTL" ? "rtl" : "ltr"} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="OG locale" htmlFor={`ll-${l.id}`}>
                <input id={`ll-${l.id}`} name="locale" defaultValue={l.locale} required className="input font-mono text-sm" />
              </Field>
              <Field label="Order" htmlFor={`lo-${l.id}`}>
                <input id={`lo-${l.id}`} name="sortOrder" type="number" min={0} max={99} defaultValue={l.sortOrder} className="input" />
              </Field>
            </div>
            <Check name="isActive" label="Active" defaultChecked={l.isActive} />
            <Check name="isDefault" label="Default (x-default)" defaultChecked={l.isDefault} />
            <div>
              <SubmitButton className="btn-sm">Save</SubmitButton>
            </div>
          </ActionForm>
        ))}
      </div>
    </>
  )
}
