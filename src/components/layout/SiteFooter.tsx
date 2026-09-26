import Link from "next/link"
import { Logo } from "@/components/brand/Logo"
import { NewsletterForm } from "@/components/newsletter/NewsletterForm"
import { CookieSettingsButton } from "@/components/consent/CookieConsent"
import { brandConfig, brandTagline } from "@/lib/brand"
import type { Dictionary } from "@/lib/i18n"

type Props = {
  lang: string
  siteName: string
  dict: Dictionary
  categories: { slug: string; name: string }[]
  newsletterEnabled: boolean
}

export function SiteFooter({ lang, siteName, dict, categories, newsletterEnabled }: Props) {
  const f = dict.footer
  const company = [
    { href: `/${lang}/about`, label: f.about },
    { href: `/${lang}/contact`, label: f.contact },
    { href: `/${lang}/editorial-policy`, label: f.editorial },
    { href: `/${lang}/advertising-policy`, label: f.advertising },
  ]
  const legal = [
    { href: `/${lang}/privacy`, label: f.privacy },
    { href: `/${lang}/terms`, label: f.terms },
    { href: `/${lang}/cookie-policy`, label: f.cookies },
  ]
  const social = [
    { href: brandConfig.social.x, label: "X" },
    { href: brandConfig.social.facebook, label: "Facebook" },
    { href: brandConfig.social.linkedin, label: "LinkedIn" },
    { href: brandConfig.social.youtube, label: "YouTube" },
    { href: brandConfig.social.instagram, label: "Instagram" },
  ].filter((s) => s.href)

  return (
    <footer className="relative mt-24 border-t border-border bg-bg-elevated">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden />
      {newsletterEnabled && (
        <section id="newsletter" aria-labelledby="newsletter-title" className="container-page py-14">
          <div className="glow-border card relative overflow-hidden p-6 sm:p-10">
            <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="eyebrow">{dict.nav.subscribe}</p>
                <h2 id="newsletter-title" className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {dict.newsletter.title}
                </h2>
                <p className="mt-2 max-w-md text-fg-muted">{dict.newsletter.description}</p>
              </div>
              <NewsletterForm lang={lang} source="footer" labels={dict.newsletter} />
            </div>
          </div>
        </section>
      )}

      <div className="container-page grid gap-10 border-t border-border py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href={`/${lang}`} className="inline-block rounded-lg">
            <Logo name={siteName} gradientId="fs-g-footer" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-fg-muted">{brandTagline(lang)}</p>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm" aria-label={f.follow}>
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="me noopener" target="_blank" className="text-fg-muted hover:text-accent">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterColumn title={f.sections} links={categories.map((c) => ({ href: `/${lang}/category/${c.slug}`, label: c.name }))} />
        <FooterColumn title={f.company} links={company} />
        <FooterColumn title={f.legal} links={legal}>
          <li>
            <CookieSettingsButton label={f.cookieSettings} />
          </li>
        </FooterColumn>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-6 text-xs text-fg-subtle">
          © {new Date().getFullYear()} {brandConfig.organization.legalName}. {f.rights}
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links, children }: { title: string; links: { href: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="grid gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-fg-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </nav>
  )
}
