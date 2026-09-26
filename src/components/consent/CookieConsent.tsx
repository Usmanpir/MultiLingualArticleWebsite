"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { consentRequired, getEffectiveConsent, getStoredConsent, OPEN_EVENT, saveConsent } from "./consent"

type Labels = {
  title: string
  text: string
  acceptAll: string
  rejectAll: string
  customize: string
  save: string
  necessary: string
  necessaryText: string
  analytics: string
  analyticsText: string
  advertising: string
  advertisingText: string
  learnMore: string
}

export function CookieConsent({ labels, policyHref }: { labels: Labels; policyHref: string }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [ads, setAds] = useState(false)
  const titleId = useId()

  useEffect(() => {
    // Deferred so the banner never competes with LCP.
    const t = setTimeout(() => {
      if (!getStoredConsent() && consentRequired()) setOpen(true)
    }, 600)
    const reopen = () => {
      const current = getEffectiveConsent()
      setAnalytics(current.analytics)
      setAds(current.ads)
      setCustom(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_EVENT, reopen)
    return () => {
      clearTimeout(t)
      window.removeEventListener(OPEN_EVENT, reopen)
    }
  }, [])

  if (!open) return null

  const decide = (choice: { analytics: boolean; ads: boolean }) => {
    saveConsent(choice)
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="card fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl p-5 sm:inset-x-auto sm:end-5 sm:bottom-5 [animation:fade-in_.25s_ease-out]"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0">
          <h2 id={titleId} className="font-semibold">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            {labels.text}{" "}
            <Link href={policyHref} className="text-accent underline underline-offset-2">
              {labels.learnMore}
            </Link>
          </p>
        </div>
      </div>

      {custom && (
        <fieldset className="mt-4 grid gap-3 border-t border-border pt-4">
          <legend className="sr-only">{labels.customize}</legend>
          <Toggle label={labels.necessary} text={labels.necessaryText} checked disabled />
          <Toggle label={labels.analytics} text={labels.analyticsText} checked={analytics} onChange={setAnalytics} />
          <Toggle label={labels.advertising} text={labels.advertisingText} checked={ads} onChange={setAds} />
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {custom ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => decide({ analytics, ads })}>
            {labels.save}
          </button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustom(true)}>
            {labels.customize}
          </button>
        )}
        {/* Reject is as prominent as accept. */}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide({ analytics: false, ads: false })}>
          {labels.rejectAll}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide({ analytics: true, ads: true })}>
          {labels.acceptAll}
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, text, checked, disabled, onChange }: { label: string; text: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0 text-sm">
        <span className="font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-fg-muted">{text}</span>
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </div>
  )
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="text-start text-fg-muted transition-colors hover:text-fg" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  )
}
