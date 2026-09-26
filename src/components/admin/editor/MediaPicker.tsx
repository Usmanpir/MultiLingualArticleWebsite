"use client"

import { useKeepValuesSubmit } from "@/components/ui/useKeepValuesSubmit"
import { useActionState, useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { uploadMediaAction } from "@/lib/actions/admin/system"
import { FormMessage, SubmitButton } from "../client"

export type MediaItem = { id: string; url: string; alt: string; width: number; height: number; caption: string | null }

/** Modal media library with inline upload. Closes on Escape; focus moves into the dialog. */
export function MediaPicker({ media, onPick, onClose, onUploaded }: { media: MediaItem[]; onPick: (m: MediaItem) => void; onClose: () => void; onUploaded: (m: MediaItem) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [state, action] = useActionState(uploadMediaAction, { ok: false })
  const onSubmit = useKeepValuesSubmit(action)
  const handled = useRef<string | null>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  useEffect(() => {
    if (state.ok && state.id && handled.current !== state.id) {
      handled.current = state.id
      fetch(`/api/admin/media/${state.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((m: MediaItem | null) => m && onUploaded(m))
        .catch(() => {})
    }
  }, [state, onUploaded])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="media-title"
      className="card m-auto w-[min(56rem,94vw)] max-w-none p-0 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id="media-title" className="font-semibold">
          Media library
        </h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => dialog.current?.close()}>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <form action={action} onSubmit={onSubmit} className="grid gap-3 border-b border-border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="mp-file">
            Upload image
          </label>
          <input id="mp-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" required className="input py-2 text-sm" />
        </div>
        <div>
          <label className="label" htmlFor="mp-alt">
            Alt text <span className="text-danger">*</span>
          </label>
          <input id="mp-alt" name="alt" required minLength={3} maxLength={200} className="input" placeholder="What the image shows" />
        </div>
        <SubmitButton>Upload</SubmitButton>
        <input type="hidden" name="caption" value="" />
        <input type="hidden" name="credit" value="" />
        <div className="sm:col-span-3">
          <FormMessage state={state} />
        </div>
      </form>
      <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-4">
        {media.length === 0 && <p className="col-span-full text-sm text-fg-muted">No images yet.</p>}
        {media.map((m) => (
          <button key={m.id} type="button" onClick={() => onPick(m)} className="group overflow-hidden rounded-xl border border-border text-start hover:border-accent focus-visible:border-accent">
            <div className="relative aspect-[4/3] bg-surface-2">
              <Image src={m.url} alt={m.alt} fill sizes="200px" className="object-cover" />
            </div>
            <p className="truncate px-2 py-1.5 text-xs text-fg-muted">{m.alt}</p>
          </button>
        ))}
      </div>
    </dialog>
  )
}
