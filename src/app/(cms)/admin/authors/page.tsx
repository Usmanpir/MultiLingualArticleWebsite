import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Check, Field, PageHeader, StatusBadge } from "@/components/admin/ui"
import { deleteAuthorAction, saveAuthorAction } from "@/lib/actions/admin/content"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Authors" }

type Lang = { id: string; code: string; name: string; direction: "LTR" | "RTL" }
type AuthorRow = {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  website: string | null
  twitter: string | null
  linkedin: string | null
  userId: string | null
  isActive: boolean
  translations: { languageId: string; jobTitle: string | null; bio: string | null }[]
}

function AuthorForm({ author, languages, users }: { author?: AuthorRow; languages: Lang[]; users: { id: string; name: string; email: string }[] }) {
  const k = author?.id ?? "new"
  return (
    <ActionForm action={saveAuthorAction} className="grid gap-4" resetOnSuccess={!author}>
      {author && <input type="hidden" name="id" value={author.id} />}
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Display name" htmlFor={`an-${k}`}>
          <input id={`an-${k}`} name="name" defaultValue={author?.name} required className="input" />
        </Field>
        <Field label="Slug" htmlFor={`as-${k}`} hint="/en/author/slug">
          <input id={`as-${k}`} name="slug" defaultValue={author?.slug} required className="input font-mono text-sm" dir="ltr" />
        </Field>
        <Field label="Linked user account" htmlFor={`au-${k}`} hint="Lets that user write as this author.">
          <select id={`au-${k}`} name="userId" defaultValue={author?.userId ?? ""} className="input">
            <option value="">None</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Avatar URL" htmlFor={`aa-${k}`} hint="Upload in Media, then paste its URL.">
          <input id={`aa-${k}`} name="avatarUrl" defaultValue={author?.avatarUrl ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="Website" htmlFor={`aw-${k}`}>
          <input id={`aw-${k}`} name="website" type="url" defaultValue={author?.website ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="X profile URL" htmlFor={`ax-${k}`}>
          <input id={`ax-${k}`} name="twitter" type="url" defaultValue={author?.twitter ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="LinkedIn URL" htmlFor={`al-${k}`}>
          <input id={`al-${k}`} name="linkedin" type="url" defaultValue={author?.linkedin ?? ""} className="input" dir="ltr" />
        </Field>
      </div>
      <Check name="isActive" label="Active (public profile)" defaultChecked={author?.isActive ?? true} />
      <div className="grid gap-4 lg:grid-cols-3">
        {languages.map((l) => {
          const tr = author?.translations.find((t) => t.languageId === l.id)
          return (
            <fieldset key={l.id} className="grid gap-3 rounded-xl border border-border p-4" lang={l.code} dir={l.direction === "RTL" ? "rtl" : "ltr"}>
              <legend className="px-1 text-sm font-semibold">{l.name}</legend>
              <Field label="Job title" htmlFor={`aj-${k}-${l.id}`}>
                <input id={`aj-${k}-${l.id}`} name={`jobTitle_${l.id}`} defaultValue={tr?.jobTitle ?? ""} className="input" />
              </Field>
              <Field label="Biography" htmlFor={`ab-${k}-${l.id}`} hint="Factual only — never invent credentials.">
                <textarea id={`ab-${k}-${l.id}`} name={`bio_${l.id}`} defaultValue={tr?.bio ?? ""} rows={4} maxLength={1500} className="input" />
              </Field>
            </fieldset>
          )
        })}
      </div>
      <div>
        <SubmitButton>{author ? "Save author" : "Create author"}</SubmitButton>
      </div>
    </ActionForm>
  )
}

export default async function AuthorsPage() {
  await requirePageUser("authors.manage")
  const [languages, authors, users] = await Promise.all([
    prisma.language.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true, name: true, direction: true } }),
    prisma.author.findMany({ orderBy: { name: "asc" }, include: { translations: true, _count: { select: { articles: true } } } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ])
  return (
    <>
      <PageHeader title="Authors" description="Public bylines. Transparent authorship supports reader trust and news-surface eligibility." />
      <div className="grid gap-3">
        {authors.map((a) => (
          <details key={a.id} className="card">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
              <span className="font-medium">{a.name}</span>
              <span className="font-mono text-xs text-fg-subtle">/{a.slug}</span>
              <StatusBadge status={a.isActive ? "ACTIVE" : "INACTIVE"} />
              <span className="ms-auto text-sm text-fg-muted">{a._count.articles} articles</span>
            </summary>
            <div className="grid gap-4 border-t border-border p-4">
              <AuthorForm author={a} languages={languages} users={users} />
              <div className="border-t border-border pt-3">
                <ConfirmAction action={deleteAuthorAction.bind(null, a.id)} confirm={`Delete author “${a.name}”?`} className="text-danger">
                  Delete author
                </ConfirmAction>
              </div>
            </div>
          </details>
        ))}
      </div>
      <section className="card mt-8 p-5">
        <h2 className="mb-4 font-semibold">New author</h2>
        <AuthorForm languages={languages} users={users} />
      </section>
    </>
  )
}
