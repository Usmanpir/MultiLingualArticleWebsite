"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Code2,
  Columns2,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Pilcrow,
  Quote,
  Table2,
  Clapperboard,
} from "lucide-react"
import { previewContentAction } from "@/lib/actions/admin/articles"
import { cn } from "@/lib/utils"
import { MediaPicker, type MediaItem } from "./MediaPicker"

type Mode = "write" | "split" | "preview"

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m?.[1] ?? null
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/**
 * Semantic HTML editor: a toolbar that inserts well-formed markup into a
 * textarea, with a live preview rendered by the same sanitiser as the site.
 */
export function RichTextField({
  id,
  value,
  onChange,
  dir,
  lang,
  media,
  onMediaAdded,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  dir: "ltr" | "rtl"
  lang: string
  media: MediaItem[]
  onMediaAdded: (m: MediaItem) => void
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<Mode>("split")
  const [preview, setPreview] = useState("")
  const [picker, setPicker] = useState(false)

  useEffect(() => {
    if (mode === "write") return
    const t = setTimeout(() => {
      previewContentAction(value).then((r) => setPreview(r.html)).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [value, mode])

  const apply = (fn: (sel: string) => { text: string; cursor?: number }) => {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = value.slice(s, e)
    const { text, cursor } = fn(sel)
    const next = value.slice(0, s) + text + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = s + (cursor ?? text.length)
      el.setSelectionRange(pos, pos)
    })
  }
  const wrap = (tag: string) => apply((sel) => ({ text: `<${tag}>${sel || "text"}</${tag}>`, cursor: sel ? undefined : tag.length + 2 }))
  const block = (html: string) => apply(() => ({ text: `\n${html}\n` }))
  const list = (tag: "ul" | "ol") =>
    apply((sel) => {
      const items = (sel || "Item one\nItem two").split(/\n+/).filter(Boolean).map((l) => `  <li>${l.trim()}</li>`)
      return { text: `\n<${tag}>\n${items.join("\n")}\n</${tag}>\n` }
    })

  // Toolbar is plain data; the ref is only read inside the click handler below.
  const tools = [
    { id: "p", label: "Paragraph", icon: Pilcrow },
    { id: "h2", label: "Heading 2", icon: Heading2 },
    { id: "h3", label: "Heading 3", icon: Heading3 },
    { id: "strong", label: "Bold", icon: Bold },
    { id: "em", label: "Italic", icon: Italic },
    { id: "link", label: "Link", icon: Link2 },
    { id: "ul", label: "Bulleted list", icon: List },
    { id: "ol", label: "Numbered list", icon: ListOrdered },
    { id: "quote", label: "Quote", icon: Quote },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "table", label: "Table", icon: Table2 },
    { id: "code", label: "Code block", icon: Code2 },
    { id: "video", label: "YouTube video", icon: Clapperboard },
    { id: "hr", label: "Divider", icon: Minus },
  ] as const

  function runTool(id: (typeof tools)[number]["id"]) {
    switch (id) {
      case "p":
      case "h2":
      case "h3":
      case "strong":
      case "em":
        return wrap(id)
      case "link": {
        const url = window.prompt("Link URL (use /en/... for internal links)")
        if (!url) return
        if (!/^(https?:\/\/|\/|mailto:)/.test(url)) return window.alert("Links must start with https://, / or mailto:")
        return apply((sel) => ({ text: `<a href="${esc(url)}">${sel || "link text"}</a>` }))
      }
      case "ul":
      case "ol":
        return list(id)
      case "quote":
        return apply((sel) => ({ text: `
<blockquote><p>${sel || "Quote"}</p><cite>Source</cite></blockquote>
` }))
      case "image":
        return setPicker(true)
      case "table":
        return block(
          `<table>
  <caption>Table caption</caption>
  <thead><tr><th scope="col">Column</th><th scope="col">Column</th></tr></thead>
  <tbody>
    <tr><td>Value</td><td>Value</td></tr>
    <tr><td>Value</td><td>Value</td></tr>
  </tbody>
</table>`,
        )
      case "code":
        return apply((sel) => ({ text: `
<pre><code class="language-ts">${esc(sel || "// code")}</code></pre>
` }))
      case "video": {
        const url = window.prompt("YouTube URL")
        const vid = url ? youtubeId(url) : null
        if (url && !vid) return window.alert("That doesn't look like a YouTube link.")
        if (vid) block(`<iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="Video"></iframe>`)
        return
      }
      case "hr":
        return block("<hr>")
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-2/60 p-1.5" role="toolbar" aria-label="Formatting">
        {tools.map((t) => (
          <button key={t.label} type="button" className="icon-btn size-8" title={t.label} aria-label={t.label} onClick={() => runTool(t.id)} disabled={mode === "preview"}>
            <t.icon className="size-4" aria-hidden />
          </button>
        ))}
        <div className="ms-auto flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Editor view">
          {(
            [
              ["write", PencilLine, "Write"],
              ["split", Columns2, "Split"],
              ["preview", Eye, "Preview"],
            ] as const
          ).map(([m, Icon, label]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium", mode === m ? "bg-accent/15 text-accent" : "text-fg-muted", m === "split" && "hidden lg:flex")}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={cn("grid", mode === "split" && "lg:grid-cols-2")}>
        {mode !== "preview" && (
          <textarea
            ref={ta}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir={dir}
            lang={lang}
            spellCheck
            className="min-h-[32rem] w-full resize-y border-0 bg-bg-elevated p-4 font-mono text-sm leading-relaxed focus:outline-none"
            placeholder="<p>Start writing…</p>"
          />
        )}
        {mode !== "write" && (
          <div dir={dir} lang={lang} className={cn("max-h-[48rem] overflow-y-auto p-6", mode === "split" && "border-s border-border")}>
            <div className="prose-article" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        )}
      </div>
      {picker && (
        <MediaPicker
          media={media}
          onClose={() => setPicker(false)}
          onUploaded={onMediaAdded}
          onPick={(m) => {
            setPicker(false)
            block(`<figure>\n  <img src="${esc(m.url)}" alt="${esc(m.alt)}" width="${m.width}" height="${m.height}">\n  <figcaption>${esc(m.caption || "")}</figcaption>\n</figure>`)
          }}
        />
      )}
    </div>
  )
}
