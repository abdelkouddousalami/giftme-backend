import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { uploadImage } from '../../api/uploads.js'
import { resolveMediaUrl } from '../../lib/media.js'
import { extractErrorMessage } from '../../api/client.js'
import { Spinner } from './Spinner.jsx'

export function ImageUploadField({ label, value, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side preview shows instantly, before the network round-trip finishes.
    const localPreviewUrl = URL.createObjectURL(file)
    setPreview(localPreviewUrl)
    setError(null)
    setProgress(0)

    try {
      const result = await uploadImage(file, setProgress)
      onChange(result.url)
    } catch (err) {
      setError(extractErrorMessage(err))
      setPreview(null)
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const displayUrl = preview ?? resolveMediaUrl(value)

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
          {displayUrl ? (
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={22} className="text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {value || preview ? 'Replace image' : 'Upload image'}
            </button>
            {(value || preview) && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  onChange(null)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>
          {progress !== null && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Spinner size={12} />
              Uploading… {progress}%
            </div>
          )}
          {error && <span className="text-xs font-medium text-black">{error}</span>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
