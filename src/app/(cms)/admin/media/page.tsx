import type { Metadata } from "next"
import Image from "next/image"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Field, PageHeader, Panel } from "@/components/admin/ui"
import { deleteMediaAction, updateMediaAction, uploadMediaAction } from "@/lib/actions/admin/system"
import { can } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { storageMode } from "@/lib/services/media"
import { clampPage } from "@/lib/utils"
import Link from "next/link"

export const metadata: Metadata = { title: "Media" }
const PER_PAGE = 36

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  const user = await requirePageUser("media.upload")
  const sp = await searchParams
  const page = clampPage(typeof sp.page === "string" ? sp.page : undefined) ?? 1
  const manage = can(user.role, "media.manage")
  const where = manage ? {} : { uploadedById: user.id }
  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { _count: { select: { articles: true } } } }),
    prisma.media.count({ where }),
  ])
  const mode = storageMode()
  return (
    <>
      <PageHeader title="Media" description={`${total} images. Uploads are resized to max 2400px, converted to WebP and stripped of metadata.`} />
      <Panel title="Upload image" className="mb-8" description={mode === "BLOB" ? "Stored in Vercel Blob." : mode === "LOCAL" ? "Stored in public/uploads (development only — configure Vercel Blob for production)." : "No storage configured: set BLOB_READ_WRITE_TOKEN."}>
        <ActionForm action={uploadMediaAction} className="grid gap-4 md:grid-cols-2" resetOnSuccess>
          <Field label="Image file" htmlFor="up-file" hint="JPEG, PNG, WebP, AVIF or GIF · max 8 MB · featured images ≥ 1200px wide">
            <input id="up-file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input py-2" />
          </Field>
          <Field label="Alt text (required)" htmlFor="up-alt" hint="Describe what the image shows for screen-reader users.">
            <input id="up-alt" name="alt" required minLength={3} maxLength={200} className="input" />
          </Field>
          <Field label="Caption" htmlFor="up-cap">
            <input id="up-cap" name="caption" maxLength={300} className="input" />
          </Field>
          <Field label="Credit" htmlFor="up-cred" hint="Photographer / source. Only upload images you have rights to use.">
            <input id="up-cred" name="credit" maxLength={120} className="input" />
          </Field>
          <div>
            <SubmitButton>Upload</SubmitButton>
          </div>
        </ActionForm>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((m) => (
          <article key={m.id} className="card overflow-hidden">
            <div className="relative aspect-[4/3] bg-surface-2">
              <Image src={m.url} alt={m.alt} fill sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="truncate font-mono text-[0.7rem] text-fg-subtle" title={m.url}>
                {m.width}×{m.height} · {(m.size / 1024).toFixed(0)} KB · {m._count.articles} uses
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Edit details</summary>
                <ActionForm action={updateMediaAction} className="mt-2 grid gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <label className="sr-only" htmlFor={`alt-${m.id}`}>
                    Alt text
                  </label>
                  <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} required className="input text-sm" placeholder="Alt text" />
                  <label className="sr-only" htmlFor={`cap-${m.id}`}>
                    Caption
                  </label>
                  <input id={`cap-${m.id}`} name="caption" defaultValue={m.caption ?? ""} className="input text-sm" placeholder="Caption" />
                  <label className="sr-only" htmlFor={`cr-${m.id}`}>
                    Credit
                  </label>
                  <input id={`cr-${m.id}`} name="credit" defaultValue={m.credit ?? ""} className="input text-sm" placeholder="Credit" />
                  <input readOnly value={m.url} className="input font-mono text-xs" aria-label="Image URL" />
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton className="btn-sm">Save</SubmitButton>
                    {manage && (
                      <ConfirmAction action={deleteMediaAction.bind(null, m.id)} confirm="Delete this image permanently?" className="text-danger">
                        Delete
                      </ConfirmAction>
                    )}
                  </div>
                </ActionForm>
              </details>
            </div>
          </article>
        ))}
      </div>
      {total > PER_PAGE && (
        <nav className="mt-6 flex justify-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 && (
            <Link className="btn btn-ghost btn-sm" href={`/admin/media?page=${page - 1}`}>
              Previous
            </Link>
          )}
          {page * PER_PAGE < total && (
            <Link className="btn btn-ghost btn-sm" href={`/admin/media?page=${page + 1}`}>
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
