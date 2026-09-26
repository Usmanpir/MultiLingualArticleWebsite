import type { Metadata } from "next"
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/client"
import { Check, Field, PageHeader, Panel, StatusBadge } from "@/components/admin/ui"
import { revokeSessionsAction, saveUserAction } from "@/lib/actions/admin/system"
import { requirePageUser } from "@/lib/auth/session"
import { formatDate } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Users" }

type U = { id: string; name: string; email: string; isActive: boolean; role: { name: string } }

function UserForm({ user }: { user?: U }) {
  const k = user?.id ?? "new"
  return (
    <ActionForm action={saveUserAction} className="grid gap-3 sm:grid-cols-2" resetOnSuccess={!user}>
      {user && <input type="hidden" name="id" value={user.id} />}
      <Field label="Name" htmlFor={`un-${k}`}>
        <input id={`un-${k}`} name="name" defaultValue={user?.name} required className="input" />
      </Field>
      <Field label="Email" htmlFor={`ue-${k}`}>
        <input id={`ue-${k}`} name="email" type="email" defaultValue={user?.email} required className="input" dir="ltr" />
      </Field>
      <Field label="Role" htmlFor={`ur-${k}`} hint="Admin: everything · Editor: content & moderation · Author: own articles">
        <select id={`ur-${k}`} name="role" defaultValue={user?.role.name ?? "AUTHOR"} className="input">
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
          <option value="AUTHOR">Author</option>
        </select>
      </Field>
      <Field label={user ? "New password (optional)" : "Password"} htmlFor={`up-${k}`} hint="At least 12 characters. Setting it signs the user out everywhere.">
        <input id={`up-${k}`} name="password" type="password" autoComplete="new-password" minLength={12} required={!user} className="input" />
      </Field>
      <Check name="isActive" label="Active" defaultChecked={user?.isActive ?? true} />
      <div className="sm:col-span-2">
        <SubmitButton className="btn-sm">{user ? "Save user" : "Create user"}</SubmitButton>
      </div>
    </ActionForm>
  )
}

export default async function UsersPage() {
  const me = await requirePageUser("users.manage")
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, include: { role: true, author: { select: { name: true } } } })
  return (
    <>
      <PageHeader title="Users" description="Newsroom accounts. Link a user to an author profile under Authors so they can write." />
      <div className="grid gap-3">
        {users.map((u) => (
          <details key={u.id} className="card">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
              <span className="font-medium">{u.name}</span>
              <span className="text-sm text-fg-subtle">{u.email}</span>
              <StatusBadge status={u.role.name === "ADMIN" ? "SCHEDULED" : u.role.name === "EDITOR" ? "REVIEW" : "DRAFT"}>{u.role.name.toLowerCase()}</StatusBadge>
              {!u.isActive && <StatusBadge status="INACTIVE" />}
              <span className="ms-auto text-xs text-fg-subtle">
                {u.author ? `Author: ${u.author.name} · ` : ""}
                {u.lastLoginAt ? `Last sign-in ${formatDate(u.lastLoginAt, "en", { month: "short" })}` : "Never signed in"}
              </span>
            </summary>
            <div className="grid gap-3 border-t border-border p-4">
              <UserForm user={u} />
              {u.id !== me.id && (
                <div className="border-t border-border pt-3">
                  <ConfirmAction action={revokeSessionsAction.bind(null, u.id)} confirm={`Sign ${u.name} out of all devices?`}>
                    Revoke sessions
                  </ConfirmAction>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
      <Panel title="New user" className="mt-8">
        <UserForm />
      </Panel>
    </>
  )
}
