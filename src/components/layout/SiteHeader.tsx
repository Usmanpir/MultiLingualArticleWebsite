import Link from "next/link"
import { Search } from "lucide-react"
import { Logo } from "@/components/brand/Logo"
import type { Dictionary } from "@/lib/i18n"
import { MobileMenu } from "./MobileMenu"
import { LanguageSwitcher, type LanguageOption } from "./LanguageSwitcher"
import { ThemeToggle } from "./ThemeToggle"

type Props = {
  lang: string
  dir: "ltr" | "rtl"
  siteName: string
  dict: Dictionary
  categories: { slug: string; name: string; color: string }[]
  languages: LanguageOption[]
}

export function SiteHeader({ lang, dir, siteName, dict, categories, languages }: Props) {
  const themeLabels = { light: dict.nav.light, dark: dict.nav.dark, system: dict.nav.system }
  const extraLinks = [
    { href: `/${lang}/about`, label: dict.footer.about },
    { href: `/${lang}/editorial-policy`, label: dict.footer.editorial },
    { href: `/${lang}/contact`, label: dict.footer.contact },
  ]
  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="container-page flex h-16 items-center gap-3">
        <Link href={`/${lang}`} className="me-auto rounded-lg" aria-label={`${siteName} — ${dict.nav.home}`}>
          <Logo name={siteName} />
        </Link>

        <Link href={`/${lang}/search`} className="icon-btn" aria-label={dict.nav.search}>
          <Search className="size-[1.15rem]" aria-hidden />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher label={dict.nav.language} languages={languages} current={lang} />
          <ThemeToggle label={dict.nav.theme} labels={themeLabels} />
          <Link href="#newsletter" className="btn btn-primary btn-sm ms-2">
            {dict.nav.subscribe}
          </Link>
        </div>
        <MobileMenu
          lang={lang}
          dir={dir}
          categories={categories}
          links={extraLinks}
          languages={languages}
          labels={{
            open: dict.nav.openMenu,
            close: dict.nav.closeMenu,
            sections: dict.nav.categories,
            language: dict.nav.language,
            theme: dict.nav.theme,
            subscribe: dict.nav.subscribe,
            themes: themeLabels,
          }}
        />
      </div>

      <nav aria-label={dict.nav.mainNav} className="hidden border-t border-border md:block">
        <ul className="container-page scrollbar-none flex h-11 items-center gap-1 overflow-x-auto text-sm [mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)]">
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/${lang}/category/${c.slug}`}
                className="group flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <span className="size-1.5 rounded-full opacity-70 transition-opacity group-hover:opacity-100" style={{ background: c.color }} aria-hidden />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
