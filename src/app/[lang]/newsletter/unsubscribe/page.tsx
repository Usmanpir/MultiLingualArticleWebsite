import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { unsubscribeNewsletter } from "@/lib/actions/newsletter"
import { getDictionary, isLocale } from "@/lib/i18n"

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Unsubscribing requires an explicit button press (POST) so link scanners can't unsubscribe people.
export default async function UnsubscribePage({ params, searchParams }: PageProps<"/[lang]/newsletter/unsubscribe">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const sp = await searchParams
  const token = typeof sp.token === "string" ? sp.token : ""
  const done = sp.done === "1"
  const invalid = sp.invalid === "1"
  const dict = getDictionary(lang).newsletter

  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
      <div className="card max-w-md p-8 text-center">
        {done ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden />
            <h1 className="mt-4 text-2xl font-bold">{dict.unsubscribedTitle}</h1>
            <p className="mt-2 text-fg-muted">{dict.unsubscribedText}</p>
          </>
        ) : invalid || !/^[a-f0-9]{48}$/.test(token) ? (
          <>
            <h1 className="text-2xl font-bold">{dict.title}</h1>
            <p className="mt-2 text-fg-muted">{dict.unsubscribeInvalid}</p>
          </>
        ) : (
          <form action={unsubscribeNewsletter}>
            <h1 className="text-2xl font-bold">{dict.title}</h1>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn btn-primary mt-6">
              {dict.unsubscribeButton}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
