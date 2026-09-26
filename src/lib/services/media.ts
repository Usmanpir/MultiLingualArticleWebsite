import "server-only"
import { randomBytes } from "node:crypto"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"
import { del, put } from "@vercel/blob"
import { HttpError } from "../http"

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"])
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export function storageMode(): "BLOB" | "LOCAL" | "NONE" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "BLOB"
  // Vercel's filesystem is read-only, so local storage is for development only.
  if (process.env.VERCEL) return "NONE"
  return "LOCAL"
}

/**
 * Validates, normalises (max 2400px, WebP) and stores an image.
 * Re-encoding strips metadata (EXIF/GPS) and neutralises polyglot files.
 */
export async function storeImage(file: File) {
  if (!ALLOWED.has(file.type)) throw new HttpError(400, "Only JPEG, PNG, WebP, AVIF or GIF images are allowed")
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(400, "Images must be 8 MB or smaller")
  const mode = storageMode()
  if (mode === "NONE") throw new HttpError(500, "No media storage configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob).")

  const input = Buffer.from(await file.arrayBuffer())
  let pipeline = sharp(input, { animated: false, limitInputPixels: 60_000_000 }).rotate()
  const meta = await pipeline.metadata()
  if (!meta.width || !meta.height) throw new HttpError(400, "Could not read image dimensions")
  if ((meta.width ?? 0) > 2400) pipeline = pipeline.resize({ width: 2400, withoutEnlargement: true })
  const { data, info } = await pipeline.webp({ quality: 82 }).toBuffer({ resolveWithObject: true })

  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "image"
  const filename = `${base}-${randomBytes(4).toString("hex")}.webp`

  if (mode === "BLOB") {
    const blob = await put(`media/${filename}`, data, { access: "public", contentType: "image/webp", addRandomSuffix: false })
    return { url: blob.url, storageKey: blob.pathname, storage: "BLOB" as const, filename, mimeType: "image/webp", size: data.length, width: info.width, height: info.height }
  }

  const dir = join(process.cwd(), "public", "uploads")
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), data)
  return { url: `/uploads/${filename}`, storageKey: `uploads/${filename}`, storage: "LOCAL" as const, filename, mimeType: "image/webp", size: data.length, width: info.width, height: info.height }
}

export async function removeStoredImage(media: { storage: string; storageKey: string | null; url: string }) {
  try {
    if (media.storage === "BLOB") await del(media.url)
    else if (media.storage === "LOCAL" && media.storageKey?.startsWith("uploads/")) await unlink(join(process.cwd(), "public", media.storageKey))
  } catch (err) {
    console.error("media file removal failed", err)
  }
}
