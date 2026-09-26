import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Empty, Field, PageHeader, Panel, Table } from "@/components/admin/ui"
import { deleteRedirectAction, saveRedirectAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { formatDate } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Redirects" }

export default async function RedirectsPage() {
  await requirePageUser("redirects.manage")
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" }, take: 500 })
  return (
    <>
      <PageHeader title="Redirects" description="Keep old URLs working. Changing a published article's slug or category creates a permanent redirect automatically." />
      <Panel title="Add redirect" className="mb-6">
        <ActionForm action={saveRedirectAction} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-end" resetOnSuccess>
          <Field label="From path" htmlFor="r-src">
            <input id="r-src" name="source" required placeholder="/en/ai/old-slug" className="input font-mono text-sm" dir="ltr" />
          </Field>
          <Field label="To path or URL" htmlFor="r-dst">
            <input id="r-dst" name="destination" required placeholder="/en/ai/new-slug" className="input font-mono text-sm" dir="ltr" />
          </Field>
          <Field label="Type" htmlFor="r-code">
            <select id="r-code" name="statusCode" defaultValue="301" className="input">
              <option value="301">Permanent</option>
              <option value="302">Temporary</option>
            </select>
          </Field>
          <SubmitButton>Save</SubmitButton>
        </ActionForm>
        <p className="mt-3 text-xs text-fg-subtle">Next.js serves permanent redirects as 308 and temporary as 307 — search engines treat them the same as 301/302.</p>
      </Panel>
      {redirects.length === 0 ? (
        <Empty>No redirects yet.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Hits</th>
              <th>Created</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {redirects.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-xs" dir="ltr">
                  {r.source}
                </td>
                <td className="font-mono text-xs" dir="ltr">
                  {r.destination}
                </td>
                <td>{r.statusCode === 301 || r.statusCode === 308 ? "permanent" : "temporary"}</td>
                <td className="tabular-nums">{r.hits}</td>
                <td className="text-fg-muted">{formatDate(r.createdAt, "en", { month: "short" })}</td>
                <td className="text-end">
                  <ConfirmAction action={deleteRedirectAction.bind(null, r.id)} confirm="Delete this redirect?" className="text-danger">
                    Delete
                  </ConfirmAction>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
