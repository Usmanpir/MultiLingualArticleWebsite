import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Field, PageHeader, Table } from "@/components/admin/ui"
import { deleteTagAction, saveTagAction } from "@/lib/actions/admin/content"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "Tags" }

type Lang = { id: string; code: string; name: string; direction: "LTR" | "RTL" }

function TagForm({ tag, languages }: { tag?: { id: string; slug: string; translations: { languageId: string; name: string; description: string | null }[] }; languages: Lang[] }) {
  const k = tag?.id ?? "new"
  return (
    <ActionForm action={saveTagAction} className="grid gap-3" resetOnSuccess={!tag}>
      {tag && <input type="hidden" name="id" value={tag.id} />}
      <Field label="Slug" htmlFor={`tslug-${k}`}>
        <input id={`tslug-${k}`} name="slug" defaultValue={tag?.slug} required className="input font-mono text-sm" dir="ltr" />
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        {languages.map((l) => {
          const tr = tag?.translations.find((t) => t.languageId === l.id)
          return (
            <div key={l.id} lang={l.code} dir={l.direction === "RTL" ? "rtl" : "ltr"} className="grid gap-2">
              <Field label={`Name (${l.name})`} htmlFor={`tn-${k}-${l.id}`}>
                <input id={`tn-${k}-${l.id}`} name={`name_${l.id}`} defaultValue={tr?.name} className="input" />
              </Field>
              <Field label={`Description (${l.name})`} htmlFor={`td-${k}-${l.id}`}>
                <textarea id={`td-${k}-${l.id}`} name={`description_${l.id}`} defaultValue={tr?.description ?? ""} rows={2} className="input" />
              </Field>
            </div>
          )
        })}
      </div>
      <div>
        <SubmitButton>{tag ? "Save tag" : "Create tag"}</SubmitButton>
      </div>
    </ActionForm>
  )
}

export default async function TagsPage() {
  await requirePageUser("tags.manage")
  const [languages, tags, settings] = await Promise.all([
    prisma.language.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true, name: true, direction: true } }),
    prisma.tag.findMany({ orderBy: { slug: "asc" }, include: { translations: true, _count: { select: { articles: true } } } }),
    getSettings(),
  ])
  return (
    <>
      <PageHeader title="Tags" description={`Topic pages are only indexable once they hold at least ${settings.tagIndexThreshold} published stories in a language — this avoids thin pages.`} />
      <section className="card mb-8 p-5">
        <h2 className="mb-4 font-semibold">New tag</h2>
        <TagForm languages={languages} />
      </section>
      <Table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Names</th>
            <th>Articles</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((t) => (
            <tr key={t.id}>
              <td className="font-mono text-xs">{t.slug}</td>
              <td>
                <details>
                  <summary className="cursor-pointer text-sm">{t.translations.map((x) => x.name).join(" · ") || "—"}</summary>
                  <div className="mt-3">
                    <TagForm tag={t} languages={languages} />
                  </div>
                </details>
              </td>
              <td className="tabular-nums">{t._count.articles}</td>
              <td className="text-end">
                <ConfirmAction action={deleteTagAction.bind(null, t.id)} confirm={`Delete tag “${t.slug}”? It will be removed from ${t._count.articles} article(s).`} className="text-danger">
                  Delete
                </ConfirmAction>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
