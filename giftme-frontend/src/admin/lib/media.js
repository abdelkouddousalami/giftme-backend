import { API_BASE_URL } from '../api/client.js'

/** Uploaded file URLs come back as backend-relative paths (e.g. "/uploads/images/x.png"); the
 * admin section calls a different origin than the app is served from, so they need the
 * backend's origin prefixed. */
export function resolveMediaUrl(path) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
