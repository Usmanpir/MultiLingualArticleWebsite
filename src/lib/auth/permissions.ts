export type RoleName = "ADMIN" | "EDITOR" | "AUTHOR"

export const permissions = [
  "dashboard.view",
  "articles.create",
  "articles.editAny",
  "articles.publish",
  "articles.delete",
  "categories.manage",
  "tags.manage",
  "media.upload",
  "media.manage",
  "comments.moderate",
  "authors.manage",
  "languages.manage",
  "newsletter.manage",
  "ads.manage",
  "settings.manage",
  "analytics.view",
  "users.manage",
  "redirects.manage",
  "pages.manage",
] as const
export type Permission = (typeof permissions)[number]

const matrix: Record<RoleName, readonly Permission[]> = {
  ADMIN: permissions,
  EDITOR: [
    "dashboard.view",
    "articles.create",
    "articles.editAny",
    "articles.publish",
    "articles.delete",
    "categories.manage",
    "tags.manage",
    "media.upload",
    "media.manage",
    "comments.moderate",
    "analytics.view",
    "redirects.manage",
  ],
  // Authors work on their own articles and can submit them for review, but cannot publish.
  AUTHOR: ["dashboard.view", "articles.create", "media.upload"],
}

export function can(role: RoleName, permission: Permission) {
  return matrix[role].includes(permission)
}
