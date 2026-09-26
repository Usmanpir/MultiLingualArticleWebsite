"use client"

import { useState, useSyncExternalStore } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { track } from "@/components/analytics/track"
import { cn } from "@/lib/utils"

const icons = {
  facebook: "M9.1 22v-8.4H6.3v-3.3h2.8V7.9c0-2.8 1.7-4.3 4.2-4.3 1.2 0 2.2.1 2.5.1v2.9h-1.7c-1.4 0-1.6.6-1.6 1.6v2.1h3.2l-.4 3.3h-2.8V22z",
  x: "M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z",
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z",
  whatsapp: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-.9.2-3.1-.7-2.6-1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z",
  telegram: "M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2L6.6 13.3 2 11.9c-1-.3-1-1 .2-1.5l18.3-7c.8-.3 1.6.2 1.4 1z",
} as const

type Network = keyof typeof icons

export function ShareButtons({
  url,
  title,
  labels,
  className,
}: {
  url: string
  title: string
  labels: { share: string; shareOn: string; copyLink: string; linkCopied: string; nativeShare: string }
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  // Native share sheet on touch devices that support it; false during SSR.
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches,
    () => false,
  )

  const u = encodeURIComponent(url)
  const tx = encodeURIComponent(title)
  const links: Record<Network, { href: string; name: string }> = {
    x: { href: `https://x.com/intent/post?url=${u}&text=${tx}`, name: "X" },
    facebook: { href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, name: "Facebook" },
    linkedin: { href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, name: "LinkedIn" },
    whatsapp: { href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, name: "WhatsApp" },
    telegram: { href: `https://t.me/share/url?url=${u}&text=${tx}`, name: "Telegram" },
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      track("share", { method: "copy_link", item_id: url })
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="group" aria-label={labels.share}>
      {canShare && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            navigator.share({ title, url }).then(() => track("share", { method: "native", item_id: url })).catch(() => {})
          }}
        >
          <Share2 className="size-4" aria-hidden />
          {labels.nativeShare}
        </button>
      )}
      {(Object.keys(links) as Network[]).map((n) => (
        <a
          key={n}
          href={links[n].href}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn size-9 border border-border"
          aria-label={labels.shareOn.replace("{network}", links[n].name)}
          onClick={() => track("share", { method: n, item_id: url })}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d={icons[n]} />
          </svg>
        </a>
      ))}
      <button type="button" className="icon-btn size-9 border border-border" onClick={copy} aria-label={copied ? labels.linkCopied : labels.copyLink}>
        {copied ? <Check className="size-4 text-success" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? labels.linkCopied : ""}
      </span>
    </div>
  )
}
