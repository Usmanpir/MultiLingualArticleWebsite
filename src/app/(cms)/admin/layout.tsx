import Link from "next/link"
import {
  BarChart3,
  FileText,
  FolderTree,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  PenLine,
  Settings,
  Shuffle,
  StickyNote,
  Tags,
  UserRound,
  Users,
} from "lucide-react"
import { LogoMark } from "@/components/brand/Logo"
import { NavLink } from "@/components/admin/client"
import { can, type Permission } from "@/lib/auth/permissions"
import { requirePageUser } from "@/lib/auth/session"
import { logoutAction } from "@/lib/actions/admin/auth"

const nav: { href: string; label: string; icon: typeof FileText; perm: Permission; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard.view", exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText, perm: "articles.create" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, perm: "categories.manage" },
  { href: "/admin/tags", label: "Tags", icon: Tags, perm: "tags.manage" },
  { href: "/admin/authors", label: "Authors", icon: UserRound, perm: "authors.manage" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, perm: "media.upload" },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare, perm: "comments.moderate" },
  { href: "/admin/pages", label: "Pages", icon: StickyNote, perm: "pages.manage" },
  { href: "/admin/languages", label: "Languages", icon: Globe2, perm: "languages.manage" },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail, perm: "newsletter.manage" },
  { href: "/admin/advertisements", label: "Advertising", icon: Megaphone, perm: "ads.manage" },
  { href: "/admin/redirects", label: "Redirects", icon: Shuffle, perm: "redirects.manage" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, perm: "analytics.view" },
  { href: "/admin/users", label: "Users", icon: Users, perm: "users.manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, perm: "settings.manage" },
]

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requirePageUser()
  const items = nav.filter((n) => can(user.role, n.perm))

  const navList = (
    <ul className="grid gap-0.5">
      {items.map(({ href, label, icon: Icon, exact }) => (
        <li key={href}>
          <NavLink href={href} exact={exact}>
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-e border-border bg-bg-elevated lg:flex lg:flex-col">
        <div className="sticky top-0 flex h-dvh flex-col">
          <Link href="/admin" className="flex items-center gap-2 border-b border-border px-5 py-4">
            <LogoMark className="size-7" gradientId="fs-g-admin" />
            <span className="font-display font-bold">Newsroom</span>
          </Link>
          <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
            {navList}
          </nav>
          <div className="border-t border-border p-3 text-sm">
            <p className="truncate px-3 font-medium">{user.name}</p>
            <p className="truncate px-3 text-xs text-fg-subtle">
              {user.email} · {user.role.toLowerCase()}
            </p>
            <form action={logoutAction} className="mt-2">
              <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-fg-muted hover:bg-surface-2 hover:text-fg">
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
          <details className="relative">
            <summary className="icon-btn cursor-pointer list-none" aria-label="Admin menu">
              <PenLine className="size-5" aria-hidden />
            </summary>
            <nav aria-label="Admin" className="card absolute start-0 top-12 z-40 w-60 p-2">
              {navList}
              <form action={logoutAction} className="mt-2 border-t border-border pt-2">
                <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg-muted hover:bg-surface-2">
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </form>
            </nav>
          </details>
          <span className="font-display font-bold">Newsroom</span>
          <Link href="/en" className="ms-auto text-sm text-fg-muted hover:text-accent">
            View site
          </Link>
        </header>
        <div className="hidden justify-end border-b border-border px-8 py-2 text-sm lg:flex">
          <Link href="/en" target="_blank" className="text-fg-muted hover:text-accent">
            View site ↗
          </Link>
        </div>
        <main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
