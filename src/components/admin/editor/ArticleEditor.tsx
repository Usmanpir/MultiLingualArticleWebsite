"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, ExternalLink, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { deleteArticleAction, deleteTranslationAction, saveArticleAction } from "@/lib/actions/admin/articles"
import type { ActionResult } from "@/lib/actions/admin/helpers"
import { cn, slugify } from "@/lib/utils"
import { StatusBadge } from "../ui"
import { MediaPicker, type MediaItem } from "./MediaPicker"
import { RichTextField } from "./RichTextField"
import { SeoChecklist, SerpPreview } from "./SeoPanel"

type ArticleStatus = "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED"
type TrStatus = "DRAFT" | "REVIEW" | "PUBLISHED"
type Robots = "INDEX_FOLLOW" | "NOINDEX_FOLLOW" | "NOINDEX_NOFOLLOW"

export type EditorTranslation = {
  id?: string
  languageId: string
  status: TrStatus
  title: string
  slug: string
  excerpt: string
  content: string
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  robots: Robots
  slugTouched?: boolean
}

export type EditorArticle = {
  id?: string
  categoryId: string
  authorId: string
  featuredImageId: string | null
  tagIds: string[]
  status: ArticleStatus
  publishedAt: string | null
  featured: boolean
  trending: boolean
  editorsPick: boolean
  allowComments: boolean
  primaryTopic: string
  secondaryTopics: string[]
  translations: EditorTranslation[]
}

type Props = {
  initial: EditorArticle
  languages: { id: string; code: string; name: string; nativeName: string; direction: "LTR" | "RTL" }[]
  categories: { id: string; slug: string; name: string }[]
  authors: { id: string; name: string }[]
  tags: { id: string; slug: string; name: string }[]
  media: MediaItem[]
  canPublish: boolean
  canDelete: boolean
  lockedAuthor: boolean
  siteName: string
  siteUrl: string
  initialLang?: string
  justSaved?: boolean
}

const emptyTranslation = (languageId: string): EditorTranslation => ({
  languageId,
  status: "DRAFT",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  robots: "INDEX_FOLLOW",
})

/** datetime-local ⇄ ISO helpers (local time in the browser). */
function toLocalInput(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ArticleEditor(props: Props) {
  const { languages, categories, authors, tags, canPublish, siteName, siteUrl } = props
  const router = useRouter()
  const [a, setA] = useState<EditorArticle>(props.initial)
  const [media, setMedia] = useState<MediaItem[]>(props.media)
  const [active, setActive] = useState<string>(() => {
    const byCode = languages.find((l) => l.code === props.initialLang)
    const existing = props.initial.translations.map((t) => t.languageId)
    if (byCode && existing.includes(byCode.id)) return byCode.id
    return existing[0] ?? languages[0]!.id
  })
  const [dirty, setDirty] = useState(false)
  const [result, setResult] = useState<ActionResult | null>(props.justSaved ? { ok: true, message: "Saved" } : null)
  const [saving, startSave] = useTransition()
  const [picker, setPicker] = useState(false)
  const [tagQuery, setTagQuery] = useState("")

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const update = (patch: Partial<EditorArticle>) => {
    setA((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }
  const tr = a.translations.find((t) => t.languageId === active)
  const lang = languages.find((l) => l.id === active)!
  const dir = lang.direction === "RTL" ? "rtl" : "ltr"
  const updateTr = (patch: Partial<EditorTranslation>) => {
    setA((prev) => ({
      ...prev,
      translations: prev.translations.map((t) => {
        if (t.languageId !== active) return t
        const next = { ...t, ...patch }
        if ("title" in patch && !t.slugTouched && !t.id) next.slug = slugify(patch.title ?? "")
        if ("slug" in patch) next.slugTouched = true
        return next
      }),
    }))
    setDirty(true)
  }

  const addTranslation = (languageId: string, copyFrom?: string) => {
    const src = copyFrom ? a.translations.find((t) => t.languageId === copyFrom) : undefined
    const base = emptyTranslation(languageId)
    // "Duplicate structure": start from another language's text so translators keep headings, figures and links.
    const t: EditorTranslation = src ? { ...base, title: src.title, slug: src.slug, excerpt: src.excerpt, content: src.content, slugTouched: true } : base
    update({ translations: [...a.translations, t] })
    setActive(languageId)
  }

  const category = categories.find((c) => c.id === a.categoryId)
  const featured = media.find((m) => m.id === a.featuredImageId) ?? null
  const url = tr ? `${siteUrl}/${lang.code}/${category?.slug ?? "section"}/${tr.slug || "slug"}` : siteUrl

  const errorsFor = useCallback(
    (field: string) => {
      if (!result?.fieldErrors) return undefined
      if (!field.startsWith("tr.")) return result.fieldErrors[field]
      const idx = a.translations.findIndex((t) => t.languageId === active)
      return result.fieldErrors[`translations.${idx}.${field.slice(3)}`]
    },
    [result, a.translations, active],
  )

  const save = (overrides: Partial<EditorArticle> = {}, trStatus?: TrStatus) => {
    const payload = { ...a, ...overrides }
    if (trStatus) payload.translations = payload.translations.map((t) => (t.languageId === active ? { ...t, status: trStatus } : t))
    const body = {
      ...payload,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt).toISOString() : null,
      translations: payload.translations.map((t) => ({ languageId: t.languageId, status: t.status, title: t.title, slug: t.slug, excerpt: t.excerpt, content: t.content, seoTitle: t.seoTitle, seoDescription: t.seoDescription, canonicalUrl: t.canonicalUrl, robots: t.robots })),
    }
    startSave(async () => {
      const res = await saveArticleAction(body)
      setResult(res)
      if (res.ok) {
        setA(payload)
        setDirty(false)
        // The page re-keys the editor on updatedAt, so this reloads fresh server state (e.g. new translation ids).
        router.replace(`/admin/articles/${res.id ?? a.id}/edit?lang=${lang.code}&saved=1`)
      }
    })
  }

  const statusOptions: ArticleStatus[] = canPublish ? ["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] : ["DRAFT", "REVIEW"]
  const filteredTags = useMemo(() => tags.filter((t) => !a.tagIds.includes(t.id) && (t.name.toLowerCase().includes(tagQuery.toLowerCase()) || t.slug.includes(tagQuery.toLowerCase()))).slice(0, 8), [tags, a.tagIds, tagQuery])
  const missing = languages.filter((l) => !a.translations.some((t) => t.languageId === l.id))

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ─────────── Main column ─────────── */}
      <div className="grid min-w-0 content-start gap-6">
        <div className="card p-2">
          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Language versions">
            {a.translations.map((t) => {
              const l = languages.find((x) => x.id === t.languageId)!
              return (
                <button
                  key={t.languageId}
                  type="button"
                  role="tab"
                  aria-selected={active === t.languageId}
                  onClick={() => setActive(t.languageId)}
                  className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium", active === t.languageId ? "bg-accent/10 text-accent" : "text-fg-muted hover:bg-surface-2")}
                >
                  {l.name}
                  <StatusBadge status={t.status} />
                </button>
              )
            })}
            {missing.map((l) => (
              <span key={l.id} className="flex items-center gap-1">
                <button type="button" onClick={() => addTranslation(l.id)} className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-strong px-3 py-2 text-sm text-fg-muted hover:border-accent hover:text-accent">
                  <Plus className="size-3.5" aria-hidden />
                  {l.name}
                </button>
                {a.translations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => addTranslation(l.id, active)}
                    className="icon-btn size-8"
                    title={`Create ${l.name} version from the current language's structure`}
                    aria-label={`Duplicate structure into ${l.name}`}
                  >
                    <Copy className="size-3.5" aria-hidden />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {!tr ? (
          <div className="card p-10 text-center text-fg-muted">Add a language version to start writing.</div>
        ) : (
          <div className="grid gap-5" lang={lang.code}>
            <div className="card grid gap-4 p-5">
              <div>
                <label htmlFor="title" className="label">
                  Title <span className="text-danger">*</span>
                </label>
                <input id="title" dir={dir} value={tr.title} onChange={(e) => updateTr({ title: e.target.value })} className="input font-display text-xl font-semibold" maxLength={160} />
                {errorsFor("tr.title") && <p className="mt-1 text-xs text-danger">{errorsFor("tr.title")}</p>}
              </div>
              <div>
                <label htmlFor="slug" className="label">
                  Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="hidden shrink-0 font-mono text-xs text-fg-subtle sm:inline" dir="ltr">
                    /{lang.code}/{category?.slug ?? "…"}/
                  </span>
                  <input id="slug" dir="ltr" value={tr.slug} onChange={(e) => updateTr({ slug: e.target.value })} className="input font-mono text-sm" maxLength={96} />
                </div>
                {errorsFor("tr.slug") ? (
                  <p className="mt-1 text-xs text-danger">{errorsFor("tr.slug")}</p>
                ) : (
                  tr.id &&
                  tr.status === "PUBLISHED" && <p className="hint">Changing a published slug automatically creates a 301 redirect from the old URL.</p>
                )}
              </div>
              <div>
                <label htmlFor="excerpt" className="label">
                  Excerpt <span className="text-danger">*</span>
                </label>
                <textarea id="excerpt" dir={dir} value={tr.excerpt} onChange={(e) => updateTr({ excerpt: e.target.value })} rows={3} maxLength={400} className="input" />
                <p className={cn("hint", errorsFor("tr.excerpt") && "text-danger")}>{errorsFor("tr.excerpt") ?? `${tr.excerpt.length}/400 — shown under the headline and used as the default meta description.`}</p>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="label">
                Content <span className="text-danger">*</span>
              </label>
              <RichTextField id="content" value={tr.content} onChange={(v) => updateTr({ content: v })} dir={dir} lang={lang.code} media={media} onMediaAdded={(m) => setMedia((prev) => [m, ...prev])} />
              {errorsFor("tr.content") && <p className="mt-1 text-xs text-danger">{errorsFor("tr.content")}</p>}
            </div>

            <div className="card grid gap-4 p-5">
              <h2 className="font-semibold">Search & social ({lang.name})</h2>
              <SerpPreview title={tr.seoTitle || tr.title} description={tr.seoDescription || tr.excerpt} url={url} siteName={siteName} dir={dir} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="seoTitle" className="label">
                    SEO title
                  </label>
                  <input id="seoTitle" dir={dir} value={tr.seoTitle} onChange={(e) => updateTr({ seoTitle: e.target.value })} maxLength={70} className="input" placeholder={tr.title} />
                  <p className="hint">{tr.seoTitle.length}/70 — optional override; “| {siteName}” is appended.</p>
                </div>
                <div>
                  <label htmlFor="canonical" className="label">
                    Canonical URL
                  </label>
                  <input id="canonical" dir="ltr" value={tr.canonicalUrl} onChange={(e) => updateTr({ canonicalUrl: e.target.value })} className="input font-mono text-sm" placeholder="Self-referencing (recommended)" />
                  <p className={cn("hint", errorsFor("tr.canonicalUrl") && "text-danger")}>{errorsFor("tr.canonicalUrl") ?? "Only set for content originally published elsewhere."}</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="seoDescription" className="label">
                    Meta description
                  </label>
                  <textarea id="seoDescription" dir={dir} value={tr.seoDescription} onChange={(e) => updateTr({ seoDescription: e.target.value })} maxLength={170} rows={2} className="input" placeholder={tr.excerpt} />
                  <p className="hint">{tr.seoDescription.length}/170 — optional; defaults to the excerpt.</p>
                </div>
                <div>
                  <label htmlFor="robots" className="label">
                    Robots
                  </label>
                  <select id="robots" value={tr.robots} onChange={(e) => updateTr({ robots: e.target.value as Robots })} className="input">
                    <option value="INDEX_FOLLOW">index, follow (default)</option>
                    <option value="NOINDEX_FOLLOW">noindex, follow</option>
                    <option value="NOINDEX_NOFOLLOW">noindex, nofollow</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="trStatus" className="label">
                    {lang.name} version status
                  </label>
                  <select id="trStatus" value={tr.status} onChange={(e) => updateTr({ status: e.target.value as TrStatus })} className="input">
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Ready for review</option>
                    {canPublish && <option value="PUBLISHED">Published</option>}
                  </select>
                  <p className="hint">Readers see this language only when both the article and this version are published.</p>
                </div>
              </div>
              {tr.id && a.translations.length > 1 && (
                <div className="border-t border-border pt-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={() => {
                      if (!window.confirm(`Delete the ${lang.name} version permanently?`)) return
                      startSave(async () => {
                        const res = await deleteTranslationAction(tr.id!)
                        setResult(res)
                        if (res.ok) {
                          const rest = a.translations.filter((t) => t.languageId !== active)
                          setA({ ...a, translations: rest })
                          setActive(rest[0]!.languageId)
                          router.refresh()
                        }
                      })
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Delete {lang.name} version
                  </button>
                </div>
              )}
              {!tr.id && a.translations.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm justify-self-start" onClick={() => {
                  const rest = a.translations.filter((t) => t.languageId !== active)
                  update({ translations: rest })
                  if (rest[0]) setActive(rest[0].languageId)
                }}>
                  <X className="size-4" aria-hidden />
                  Discard unsaved {lang.name} version
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─────────── Sidebar ─────────── */}
      <aside className="grid content-start gap-5 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto xl:pe-1">
        <div className="card grid gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Publishing</h2>
            <StatusBadge status={a.status} />
          </div>
          <div>
            <label htmlFor="status" className="label">
              Article status
            </label>
            <select id="status" value={a.status} onChange={(e) => update({ status: e.target.value as ArticleStatus })} className="input">
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          {canPublish && (
            <div>
              <label htmlFor="publishedAt" className="label">
                {a.status === "SCHEDULED" ? "Go live at" : "Publish date"}
              </label>
              <input
                id="publishedAt"
                type="datetime-local"
                value={toLocalInput(a.publishedAt)}
                onChange={(e) => update({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="input"
              />
              <p className={cn("hint", errorsFor("publishedAt") && "text-danger")}>{errorsFor("publishedAt") ?? "Your local time. Scheduled articles go live automatically."}</p>
            </div>
          )}
          {result?.message && (
            <p role={result.ok ? "status" : "alert"} className={cn("text-sm", result.ok ? "text-success" : "text-danger")}>
              {result.message}
            </p>
          )}
          <div className="grid gap-2">
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => save()}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              Save{dirty ? " changes" : ""}
            </button>
            {canPublish ? (
              <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => save({ status: "PUBLISHED" }, "PUBLISHED")}>
                Publish {lang.name} now
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => save({ status: "REVIEW" }, "REVIEW")}>
                Submit for review
              </button>
            )}
          </div>
          {a.id && tr?.id && tr.status === "PUBLISHED" && (a.status === "PUBLISHED" || a.status === "SCHEDULED") && (
            <Link href={`/${lang.code}/${category?.slug}/${tr.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm text-accent hover:underline">
              <ExternalLink className="size-4" aria-hidden />
              View live {lang.name} page
            </Link>
          )}
        </div>

        <div className="card grid gap-3 p-5">
          <h2 className="font-semibold">Details</h2>
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select id="category" value={a.categoryId} onChange={(e) => update({ categoryId: e.target.value })} className="input">
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errorsFor("categoryId") && <p className="mt-1 text-xs text-danger">{errorsFor("categoryId")}</p>}
          </div>
          <div>
            <label htmlFor="author" className="label">
              Author
            </label>
            <select id="author" value={a.authorId} onChange={(e) => update({ authorId: e.target.value })} className="input" disabled={props.lockedAuthor}>
              <option value="">Choose…</option>
              {authors.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="label">Tags</p>
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {a.tagIds.map((id) => {
                const t = tags.find((x) => x.id === id)
                return (
                  <li key={id}>
                    <button type="button" className="chip hover:border-danger hover:text-danger" onClick={() => update({ tagIds: a.tagIds.filter((x) => x !== id) })} aria-label={`Remove tag ${t?.name}`}>
                      #{t?.name ?? id}
                      <X className="size-3" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
            <label htmlFor="tagq" className="sr-only">
              Find tags
            </label>
            <input id="tagq" value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} placeholder="Find a tag…" className="input text-sm" />
            {tagQuery && (
              <ul className="mt-1 grid gap-0.5">
                {filteredTags.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1 text-start text-sm hover:bg-surface-2"
                      onClick={() => {
                        update({ tagIds: [...a.tagIds, t.id] })
                        setTagQuery("")
                      }}
                    >
                      #{t.name}
                    </button>
                  </li>
                ))}
                {filteredTags.length === 0 && <li className="px-2 py-1 text-xs text-fg-subtle">No match — create tags under Tags.</li>}
              </ul>
            )}
          </div>
          <div>
            <p className="label">Featured image</p>
            {featured ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="relative aspect-[16/9] bg-surface-2">
                  <Image src={featured.url} alt={featured.alt} fill sizes="320px" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <p className="truncate text-xs text-fg-muted">{featured.alt}</p>
                  <button type="button" className="text-xs text-danger hover:underline" onClick={() => update({ featuredImageId: null })}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setPicker(true)} className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-sm text-fg-muted hover:border-accent hover:text-accent">
                <ImagePlus className="size-5" aria-hidden />
                Choose image (≥ 1200px wide)
              </button>
            )}
            {featured && (
              <button type="button" className="mt-2 text-xs text-accent hover:underline" onClick={() => setPicker(true)}>
                Change image
              </button>
            )}
          </div>
        </div>

        <div className="card grid gap-3 p-5">
          <h2 className="font-semibold">Placement & topics</h2>
          {canPublish && (
            <>
              <Toggle label="Featured on home page" checked={a.featured} onChange={(v) => update({ featured: v })} />
              <Toggle label="Trending" checked={a.trending} onChange={(v) => update({ trending: v })} />
              <Toggle label="Editor's pick" checked={a.editorsPick} onChange={(v) => update({ editorsPick: v })} />
            </>
          )}
          <Toggle label="Allow comments" checked={a.allowComments} onChange={(v) => update({ allowComments: v })} />
          <div>
            <label htmlFor="topic" className="label">
              Primary topic
            </label>
            <input id="topic" value={a.primaryTopic} onChange={(e) => update({ primaryTopic: e.target.value })} className="input text-sm" maxLength={80} placeholder="e.g. AI agents" />
          </div>
          <div>
            <label htmlFor="topics2" className="label">
              Secondary topics
            </label>
            <input
              id="topics2"
              value={a.secondaryTopics.join(", ")}
              onChange={(e) => update({ secondaryTopics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10) })}
              className="input text-sm"
              placeholder="Comma separated"
            />
            <p className="hint">For editorial planning only — never output as meta keywords.</p>
          </div>
        </div>

        {tr && (
          <div className="card p-5">
            <SeoChecklist
              input={{
                lang: lang.code,
                title: tr.title,
                seoTitle: tr.seoTitle,
                seoDescription: tr.seoDescription,
                excerpt: tr.excerpt,
                slug: tr.slug,
                content: tr.content,
                canonicalUrl: tr.canonicalUrl,
                siteName,
                siteUrl,
                featuredImage: featured ? { alt: featured.alt } : null,
                primaryTopic: a.primaryTopic,
                translationCount: a.translations.length,
                languageCount: languages.length,
              }}
            />
          </div>
        )}

        {a.id && props.canDelete && (
          <button
            type="button"
            className="btn btn-ghost text-danger"
            disabled={saving}
            onClick={() => {
              if (!window.confirm("Delete this article and all its translations? This cannot be undone.")) return
              startSave(async () => {
                const res = await deleteArticleAction(a.id!)
                if (res.ok) {
                  setDirty(false)
                  router.push("/admin/articles")
                } else setResult(res)
              })
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete article
          </button>
        )}
      </aside>

      {picker && (
        <MediaPicker
          media={media}
          onClose={() => setPicker(false)}
          onUploaded={(m) => setMedia((prev) => [m, ...prev])}
          onPick={(m) => {
            update({ featuredImageId: m.id })
            setPicker(false)
          }}
        />
      )}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--accent)]" />
    </label>
  )
}
