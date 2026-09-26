import type { Metadata } from "next"
import { ActionForm, SubmitButton } from "@/components/admin/client"
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm"
import { Check, Field, PageHeader, Panel } from "@/components/admin/ui"
import { saveSettingsAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { brandDescription } from "@/lib/brand"
import { publicEnv, siteUrl } from "@/lib/env"
import { localeMeta, locales } from "@/lib/i18n"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  await requirePageUser("settings.manage")
  const s = await getSettings()
  return (
    <>
      <PageHeader title="Settings" description="Global SEO, identity and feature switches. Secrets and IDs for Analytics/AdSense live in environment variables." />
      <ActionForm action={saveSettingsAction} className="grid gap-6">
        <Panel title="Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Site name" htmlFor="siteName" hint="Used in titles (“Article | Site name”), Open Graph and JSON-LD.">
              <input id="siteName" name="siteName" defaultValue={s.siteName} required className="input" />
            </Field>
            <Field label="X (Twitter) handle" htmlFor="xHandle">
              <input id="xHandle" name="xHandle" defaultValue={s.xHandle} placeholder="@yourhandle" className="input" />
            </Field>
            <Field label="Organization name" htmlFor="organizationName">
              <input id="organizationName" name="organizationName" defaultValue={s.organizationName} required className="input" />
            </Field>
            <Field label="Organization logo" htmlFor="organizationLogo" hint="Square PNG, ≥ 112px (512px recommended).">
              <input id="organizationLogo" name="organizationLogo" defaultValue={s.organizationLogo} className="input" dir="ltr" />
            </Field>
            <Field label="Default social image" htmlFor="defaultOgImage" hint="1200×630 used when a page has no image of its own.">
              <input id="defaultOgImage" name="defaultOgImage" defaultValue={s.defaultOgImage} className="input" dir="ltr" />
            </Field>
          </div>
        </Panel>

        <Panel title="Home page descriptions" description="Meta descriptions for each language's home page. Leave empty to use the brand default.">
          <div className="grid gap-4 lg:grid-cols-3">
            {locales.map((l) => (
              <Field key={l} label={localeMeta[l].name} htmlFor={`d-${l}`}>
                <textarea id={`d-${l}`} name={`description_${l}`} defaultValue={s.descriptions[l] ?? ""} placeholder={brandDescription(l)} maxLength={200} rows={3} className="input" dir={localeMeta[l].dir} lang={l} />
              </Field>
            ))}
          </div>
        </Panel>

        <Panel title="Search engines" description="Verification tags are only output when set. Verifying in Search Console / Bing Webmaster Tools is something you do in their dashboards.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Google site verification" htmlFor="googleVerification" hint="The content value of the google-site-verification meta tag.">
              <input id="googleVerification" name="googleVerification" defaultValue={s.googleVerification} className="input font-mono text-sm" />
            </Field>
            <Field label="Bing site verification" htmlFor="bingVerification" hint="The content value of msvalidate.01.">
              <input id="bingVerification" name="bingVerification" defaultValue={s.bingVerification} className="input font-mono text-sm" />
            </Field>
            <Field label="Tag page index threshold" htmlFor="tagIndexThreshold" hint="Minimum published stories before a tag page is indexable.">
              <input id="tagIndexThreshold" name="tagIndexThreshold" type="number" min={1} max={50} defaultValue={s.tagIndexThreshold} className="input" />
            </Field>
          </div>
          <div className="mt-4 grid gap-3">
            <Check name="indexSite" label="Allow search engines to index the site" defaultChecked={s.indexSite} hint="Turn off for staging; adds noindex to every page." />
            <Check name="sitemapIncludeTags" label="Include tag pages in the sitemap" defaultChecked={s.sitemapIncludeTags} />
            <Check name="sitemapIncludeAuthors" label="Include author pages in the sitemap" defaultChecked={s.sitemapIncludeAuthors} />
            <Check name="newsArticleSchema" label="Mark articles as NewsArticle" defaultChecked={s.newsArticleSchema} hint="Only if you publish genuine, timely news reporting. Otherwise Article is used." />
          </div>
          <p className="mt-4 text-sm text-fg-muted">
            Sitemap: <a href="/sitemap.xml" className="font-mono text-accent">{siteUrl}/sitemap.xml</a> · Robots: <a href="/robots.txt" className="font-mono text-accent">/robots.txt</a>
          </p>
        </Panel>

        <Panel title="Features">
          <div className="grid gap-3">
            <Check name="commentsEnabled" label="Enable comments site-wide" defaultChecked={s.commentsEnabled} hint="Per-article switches still apply." />
            <Check name="newsletterEnabled" label="Enable newsletter sign-up" defaultChecked={s.newsletterEnabled} />
          </div>
          <p className="mt-4 text-xs text-fg-subtle">
            Analytics: {publicEnv.gaMeasurementId ? `GA4 ${publicEnv.gaMeasurementId}` : "NEXT_PUBLIC_GA_MEASUREMENT_ID not set"} · AdSense: {publicEnv.adsenseEnabled && publicEnv.adsenseClientId ? "enabled" : "disabled"} · Consent regions: {publicEnv.consentRegions}
          </p>
        </Panel>

        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </ActionForm>

      <Panel title="Your password" className="mt-10 max-w-md">
        <ChangePasswordForm />
      </Panel>
    </>
  )
}
