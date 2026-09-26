import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Check, Field, PageHeader, StatusBadge } from "@/components/admin/ui"
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/admin/content"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Categories" }

type Lang = { id: string; code: string; name: string; direction: "LTR" | "RTL" }
type Cat = {
  id: string
  slug: string
  color: string
  sortOrder: number
  isActive: boolean
  translations: { languageId: string; name: string; description: string | null; seoTitle: string | null; seoDescription: string | null }[]
}

function CategoryForm({ cat, languages }: { cat?: Cat; languages: Lang[] }) {
  const k = cat?.id ?? "new"
  return (
    <ActionForm action={saveCategoryAction} className="grid gap-4" resetOnSuccess={!cat}>
      {cat && <input type="hidden" name="id" value={cat.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Slug" htmlFor={`slug-${k}`} hint="Used in URLs — changing it breaks links unless you add a redirect.">
          <input id={`slug-${k}`} name="slug" defaultValue={cat?.slug} required className="input font-mono text-sm" dir="ltr" />
        </Field>
        <Field label="Accent colour" htmlFor={`color-${k}`}>
          <input id={`color-${k}`} name="color" type="color" defaultValue={cat?.color ?? "#22d3ee"} className="input h-11 p-1" />
        </Field>
        <Field label="Sort order" htmlFor={`sort-${k}`}>
          <input id={`sort-${k}`} name="sortOrder" type="number" min={0} max={999} defaultValue={cat?.sortOrder ?? 0} className="input" />
        </Field>
      </div>
      <Check name="isActive" label="Active (shown in navigation)" defaultChecked={cat?.isActive ?? true} />
      <div className="grid gap-4 lg:grid-cols-3">
        {languages.map((l) => {
          const tr = cat?.translations.find((t) => t.languageId === l.id)
          const dir = l.direction === "RTL" ? "rtl" : "ltr"
          return (
            <fieldset key={l.id} className="grid gap-3 rounded-xl border border-border p-4" lang={l.code} dir={dir}>
              <legend className="px-1 text-sm font-semibold">{l.name}</legend>
              <Field label="Name" htmlFor={`name-${k}-${l.id}`}>
                <input id={`name-${k}-${l.id}`} name={`name_${l.id}`} defaultValue={tr?.name} className="input" />
              </Field>
              <Field label="Description" htmlFor={`desc-${k}-${l.id}`}>
                <textarea id={`desc-${k}-${l.id}`} name={`description_${l.id}`} defaultValue={tr?.description ?? ""} rows={2} className="input" />
              </Field>
              <Field label="SEO title" htmlFor={`st-${k}-${l.id}`}>
                <input id={`st-${k}-${l.id}`} name={`seoTitle_${l.id}`} defaultValue={tr?.seoTitle ?? ""} maxLength={70} className="input" />
              </Field>
              <Field label="Meta description" htmlFor={`sd-${k}-${l.id}`}>
                <textarea id={`sd-${k}-${l.id}`} name={`seoDescription_${l.id}`} defaultValue={tr?.seoDescription ?? ""} maxLength={170} rows={2} className="input" />
              </Field>
            </fieldset>
          )
        })}
      </div>
      <div className="flex gap-2">
        <SubmitButton>{cat ? "Save category" : "Create category"}</SubmitButton>
      </div>
    </ActionForm>
  )
}

export default async function CategoriesPage() {
  await requirePageUser("categories.manage")
  const [languages, categories] = await Promise.all([
    prisma.language.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true, name: true, direction: true } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { slug: "asc" }], include: { translations: true, _count: { select: { articles: true } } } }),
  ])
  return (
    <>
      <PageHeader title="Categories" description="Sections of the publication. Names and SEO text are managed per language." />
      <div className="grid gap-3">
        {categories.map((c) => (
          <details key={c.id} className="card group">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
              <span className="size-3 rounded-full" style={{ background: c.color }} aria-hidden />
              <span className="font-medium">{c.translations.find((t) => t.languageId === languages[0]?.id)?.name ?? c.slug}</span>
              <span className="font-mono text-xs text-fg-subtle">/{c.slug}</span>
              <StatusBadge status={c.isActive ? "ACTIVE" : "INACTIVE"} />
              <span className="ms-auto text-sm text-fg-muted">
                {c._count.articles} articles · {c.translations.length}/{languages.length} languages
              </span>
            </summary>
            <div className="grid gap-4 border-t border-border p-4">
              <CategoryForm cat={c} languages={languages} />
              <div className="border-t border-border pt-3">
                <ConfirmAction action={deleteCategoryAction.bind(null, c.id)} confirm={`Delete category “${c.slug}”?`} variant="ghost" className="text-danger">
                  Delete category
                </ConfirmAction>
              </div>
            </div>
          </details>
        ))}
      </div>
      <section className="card mt-8 p-5">
        <h2 className="mb-4 font-semibold">New category</h2>
        <CategoryForm languages={languages} />
      </section>
    </>
  )
}
