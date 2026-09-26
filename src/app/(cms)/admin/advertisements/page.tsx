import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Check, Field, PageHeader, Panel, StatusBadge } from "@/components/admin/ui"
import { deleteAdAction, saveAdAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { publicEnv } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Advertising" }

const PLACEMENTS = [
  ["HEADER_BANNER", "Header banner (reserved, not placed by default)"],
  ["HOME_INLINE", "Home & archives — between sections"],
  ["ARTICLE_TOP", "Article — below the featured image"],
  ["ARTICLE_MIDDLE", "Article — mid-content (long articles only)"],
  ["ARTICLE_BOTTOM", "Article — after the author box"],
  ["SIDEBAR", "Home sidebar"],
  ["MOBILE_STICKY", "Mobile sticky (reserved, not placed by default)"],
] as const

type Ad = { id: string; name: string; placement: string; adSlotId: string; format: string; responsive: boolean; isActive: boolean }

function AdForm({ ad }: { ad?: Ad }) {
  const k = ad?.id ?? "new"
  return (
    <ActionForm action={saveAdAction} className="grid gap-3 sm:grid-cols-2" resetOnSuccess={!ad}>
      {ad && <input type="hidden" name="id" value={ad.id} />}
      <Field label="Internal name" htmlFor={`adn-${k}`}>
        <input id={`adn-${k}`} name="name" defaultValue={ad?.name} required className="input" />
      </Field>
      <Field label="Placement" htmlFor={`adp-${k}`}>
        <select id={`adp-${k}`} name="placement" defaultValue={ad?.placement ?? "ARTICLE_MIDDLE"} className="input">
          {PLACEMENTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="AdSense ad unit slot id" htmlFor={`ads-${k}`} hint="The numeric data-ad-slot value from your AdSense account.">
        <input id={`ads-${k}`} name="adSlotId" defaultValue={ad?.adSlotId} required inputMode="numeric" pattern="\d{6,20}" className="input font-mono" />
      </Field>
      <Field label="Format" htmlFor={`adf-${k}`}>
        <select id={`adf-${k}`} name="format" defaultValue={ad?.format ?? "auto"} className="input">
          {["auto", "fluid", "rectangle", "horizontal", "vertical"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Check name="responsive" label="Full-width responsive" defaultChecked={ad?.responsive ?? true} />
      <Check name="isActive" label="Active" defaultChecked={ad?.isActive ?? true} />
      <div className="sm:col-span-2">
        <SubmitButton className="btn-sm">{ad ? "Save" : "Add ad unit"}</SubmitButton>
      </div>
    </ActionForm>
  )
}

export default async function AdsPage() {
  await requirePageUser("ads.manage")
  const ads = await prisma.advertisement.findMany({ orderBy: [{ placement: "asc" }, { updatedAt: "desc" }] })
  const ready = publicEnv.adsenseEnabled && !!publicEnv.adsenseClientId
  return (
    <>
      <PageHeader title="Advertising" description="Google AdSense placements. Ads render only when AdSense is enabled, a publisher id is set, an active unit exists and the reader has consented where required." />
      <Panel title="Status" className="mb-6">
        <ul className="grid gap-1 text-sm">
          <li>
            NEXT_PUBLIC_ADSENSE_ENABLED: <StatusBadge status={publicEnv.adsenseEnabled ? "ACTIVE" : "INACTIVE"}>{publicEnv.adsenseEnabled ? "true" : "false"}</StatusBadge>
          </li>
          <li>
            NEXT_PUBLIC_ADSENSE_CLIENT_ID: <span className="font-mono">{publicEnv.adsenseClientId || "not set"}</span>
          </li>
          <li className="text-fg-muted">{ready ? "AdSense is configured. Units below will render in production." : "AdSense is not active — no ad containers are rendered on the site."}</li>
        </ul>
        <p className="mt-3 text-xs text-fg-subtle">
          Policy reminders: never ask readers to click ads, don&apos;t place ads where they can be mistaken for navigation or content, and keep ads out of pages without substantial content. In the EEA/UK a Google-certified consent platform is required for personalised ads.
        </p>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        {ads.map((ad) => (
          <div key={ad.id} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{ad.name}</h2>
              <StatusBadge status={ad.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
            <AdForm ad={ad} />
            <div className="mt-3 border-t border-border pt-3">
              <ConfirmAction action={deleteAdAction.bind(null, ad.id)} confirm="Delete this ad unit?" className="text-danger">
                Delete
              </ConfirmAction>
            </div>
          </div>
        ))}
      </div>
      <Panel title="New ad unit" className="mt-6">
        <AdForm />
      </Panel>
    </>
  )
}
