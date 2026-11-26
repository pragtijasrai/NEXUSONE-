/**
 * Upload middleware — Multer with memory storage.
 *
 * Why memory storage, not disk?
 *   - Production deployments (Heroku, Render, Fly.io, Docker) have
 *     ephemeral filesystems — files on disk vanish between deploys.
 *   - In-memory buffers let us push bytes anywhere: S3-compatible storage,
 *     a database BLOB, or a data URI. The storage adapter below writes
 *     the file to the DB as a data URI, which survives restarts and works
 *     on any host. For very large files or high traffic, swap the adapter
 *     for S3 — only `persistFile()` changes.
 *
 * Limits:
 *   - 1 MB max (suitable for avatars and small attachments)
 *   - Images: PNG / JPG / JPEG / WEBP
 *   - Documents: PDF (ticket attachments)
 *
 * Security:
 *   - MIME type allow-list checked by Multer, plus magic-byte sniffing
 *     below (a renamed .exe pretending to be a .png is rejected).
 *   - Files are never executed; they're served inline with explicit
 *     Content-Type from a data URI.
 */

import multer from 'multer';
import { AppError } from '../utils/AppError.js';

/* ── Magic bytes for common image + PDF formats ── */
const MAGIC = {
  png:  [0x89, 0x50, 0x4E, 0x47],
  jpg:  [0xFF, 0xD8, 0xFF],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF" — webp container
  pdf:  [0x25, 0x50, 0x44, 0x46], // "%PDF"
};

function sniffMime(buf) {
  const startsWith = (bytes) => bytes.every((b, i) => buf[i] === b);
  if (startsWith(MAGIC.png))  return 'image/png';
  if (startsWith(MAGIC.jpg))  return 'image/jpeg';
  if (startsWith(MAGIC.pdf))  return 'application/pdf';
  if (startsWith(MAGIC.webp) && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

/* ── Image upload (avatars) ── */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype);
    if (!ok) return cb(new AppError(400, 'Only PNG, JPG or WEBP images are allowed', 'INVALID_FILE_TYPE'));
    cb(null, true);
  },
});

/* ── Document upload (ticket attachments: image or PDF) ── */
export const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'].includes(file.mimetype);
    if (!ok) return cb(new AppError(400, 'Only PNG, JPG, WEBP images or PDF are allowed', 'INVALID_FILE_TYPE'));
    cb(null, true);
  },
});

/**
 * Persist an uploaded file.
 * Validates magic bytes, then stores as a data URI in the DB-compatible
 * string format. Returns the data URI (assigned to users.avatar_url or
 * maintenance_tickets.attachment_url).
 *
 * For real S3/Cloudinary deployment, replace the body with a signed
 * upload and return the public URL — the interface stays the same.
 */
export function persistFile(fileBuf, declaredMime, purpose = 'avatar') {
  const sniffed = sniffMime(fileBuf);

  if (!sniffed) {
    throw new AppError(400, 'File content does not match an allowed type', 'INVALID_FILE_CONTENT');
  }

  /* Normalise jpeg variants */
  const declared = declaredMime === 'image/jpg' ? 'image/jpeg' : declaredMime;

  /* The sniffed type must agree with the declared MIME (anti-spoofing) */
  if (sniffed !== declared) {
    throw new AppError(400, 'File content does not match its declared type', 'MIME_MISMATCH');
  }

  if (purpose === 'avatar' && !sniffed.startsWith('image/')) {
    throw new AppError(400, 'Profile photos must be PNG, JPG or WEBP images', 'AVATAR_NOT_IMAGE');
  }

  const base64 = fileBuf.toString('base64');
  return `data:${sniffed};base64,${base64}`;
}

/** Delete a stored file — data URIs need no cleanup; S3 keys would. */
export function deleteStoredFile(_dataUri) {
  /* No-op for data-URI storage. When moving to S3, delete the object here. */
  return true;
}
