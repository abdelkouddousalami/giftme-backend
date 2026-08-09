import { apiClient } from '../lib/api.js'

/**
 * Media upload — `POST /api/uploads/{image|video|audio}` (UploadController).
 *
 * Public but rate-limited, precisely so a guest can attach a photo while
 * personalizing a product before any account or order exists.
 *
 * The backend validates by *content* (Apache Tika magic-byte sniffing) as well
 * as by extension and size, so a rejected file here is a real rejection — the
 * limits below mirror `giftme.storage.limits.*` only to fail fast in the UI and
 * are never the actual gate.
 *
 * Returns UploadResponse { url, fileName, size, type }. `url` is
 * backend-relative (e.g. `/uploads/images/x.png`) — render it through
 * `resolveMediaUrl` and send it back to the API exactly as received.
 */

export const UPLOAD_LIMITS = {
  image: { maxBytes: 5 * 1024 * 1024, accept: 'image/jpeg,image/png,image/webp,image/gif' },
  video: { maxBytes: 50 * 1024 * 1024, accept: 'video/mp4,video/quicktime,video/webm' },
  audio: { maxBytes: 20 * 1024 * 1024, accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a' },
}

async function upload(kind, file) {
  const formData = new FormData()
  // The backend reads @RequestParam("file") — the field name is part of the contract.
  formData.append('file', file)

  const { data } = await apiClient.post(`/api/uploads/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export const uploadImage = (file) => upload('image', file)
export const uploadVideo = (file) => upload('video', file)
export const uploadAudio = (file) => upload('audio', file)
