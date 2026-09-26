import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader, Panel, Stat } from "@/components/admin/ui"
import { requirePageUser } from "@/lib/auth/session"
import { formatNumber } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { publicEnv } from "@/lib/env"

export const metadata: Metadata = { title: "Analytics" }

const DAYS = 30

export default async function AnalyticsPage() {
  await requirePageUser("analytics.view")
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - (DAYS - 1))

  const [daily, byLang, top] = await Promise.all([
    prisma.articleView.groupBy({ by: ["viewDate"], where: { viewDate: { gte: since } }, _count: { _all: true }, orderBy: { viewDate: "asc" } }),
    prisma.articleView.groupBy({ by: ["languageCode"], where: { viewDate: { gte: since } }, _count: { _all: true } }),
    prisma.articleView.groupBy({ by: ["articleId"], where: { viewDate: { gte: since } }, _count: { _all: true }, orderBy: { _count: { articleId: "desc" } }, take: 10 }),
  ])
  const titles = await prisma.articleTranslation.findMany({
    where: { articleId: { in: top.map((t) => t.articleId) } },
    select: { articleId: true, title: true, language: { select: { code: true } } },
  })

  // Fill missing days with zero so the time axis is continuous.
  const series = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since)
    d.setUTCDate(since.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    const hit = daily.find((x) => x.viewDate.toISOString().slice(0, 10) === key)
    return { key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), value: hit?._count._all ?? 0 }
  })
  const total = series.reduce((n, d) => n + d.value, 0)
  const max = Math.max(1, ...series.map((d) => d.value))
  const langTotal = Math.max(1, byLang.reduce((n, l) => n + l._count._all, 0))

  return (
    <>
      <PageHeader title="Analytics" description="First-party, cookie-less counts: one view per anonymous reader per article per day. Use GA4 for deeper behaviour analysis." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label={`Views · last ${DAYS} days`} value={formatNumber(total, "en")} />
        <Stat label="Daily average" value={formatNumber(Math.round(total / DAYS), "en")} />
        <Stat label="Google Analytics 4" value={publicEnv.gaMeasurementId ? "Connected" : "Not set"} hint={publicEnv.gaMeasurementId || "Set NEXT_PUBLIC_GA_MEASUREMENT_ID"} />
      </div>

      <Panel title="Daily article views" description={`Last ${DAYS} days (UTC)`}>
        <figure>
          <div className="relative h-56" role="img" aria-label={`Bar chart of daily views over the last ${DAYS} days; peak ${max}. A table follows.`}>
            {/* Recessive gridlines */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-border" style={{ bottom: `${f * 100}%` }}>
                <span className="absolute -top-2.5 end-0 bg-surface ps-1 text-[10px] text-fg-subtle tabular-nums">{Math.round(max * f)}</span>
              </div>
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px] pe-8">
              {series.map((d) => (
                <div key={d.key} className="group relative flex h-full flex-1 items-end">
                  <div className="w-full rounded-t-[4px] bg-accent/80 transition-colors group-hover:bg-accent" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 2 : 0 }} />
                  <div className="card pointer-events-none absolute bottom-full start-1/2 z-10 mb-1 hidden -translate-x-1/2 px-2 py-1 text-xs whitespace-nowrap group-hover:block rtl:translate-x-1/2">
                    <span className="text-fg-muted">{d.label}</span> · <span className="font-semibold tabular-nums">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between pe-8 text-[10px] text-fg-subtle">
            <span>{series[0]!.label}</span>
            <span>{series[Math.floor(DAYS / 2)]!.label}</span>
            <span>{series[DAYS - 1]!.label}</span>
          </div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-fg-muted">Show data table</summary>
            <table className="mt-2 w-full max-w-sm text-xs">
              <thead>
                <tr className="text-fg-subtle">
                  <th className="py-1 text-start">Date</th>
                  <th className="py-1 text-end">Views</th>
                </tr>
              </thead>
              <tbody>
                {series.map((d) => (
                  <tr key={d.key} className="border-t border-border">
                    <td className="py-1">{d.key}</td>
                    <td className="py-1 text-end tabular-nums">{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </figure>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Views by language">
          {byLang.length === 0 ? (
            <p className="text-sm text-fg-muted">No data yet.</p>
          ) : (
            <ul className="grid gap-3">
              {byLang
                .sort((a, b) => b._count._all - a._count._all)
                .map((l) => (
                  <li key={l.languageCode} className="text-sm">
                    <div className="mb-1 flex justify-between">
                      <span className="font-medium uppercase">{l.languageCode}</span>
                      <span className="tabular-nums text-fg-muted">
                        {formatNumber(l._count._all, "en")} · {Math.round((l._count._all / langTotal) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent/80" style={{ width: `${(l._count._all / langTotal) * 100}%` }} />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
        <Panel title={`Top articles · ${DAYS} days`}>
          {top.length === 0 ? (
            <p className="text-sm text-fg-muted">No data yet.</p>
          ) : (
            <ol className="grid gap-2 text-sm">
              {top.map((t, i) => {
                const ts = titles.filter((x) => x.articleId === t.articleId)
                const title = (ts.find((x) => x.language.code === "en") ?? ts[0])?.title ?? t.articleId
                return (
                  <li key={t.articleId} className="flex gap-3">
                    <span className="w-5 font-mono text-fg-subtle">{i + 1}</span>
                    <Link href={`/admin/articles/${t.articleId}/edit`} className="min-w-0 flex-1 truncate hover:text-accent">
                      {title}
                    </Link>
                    <span className="tabular-nums text-fg-muted">{formatNumber(t._count._all, "en")}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>
      </div>
    </>
  )
}
