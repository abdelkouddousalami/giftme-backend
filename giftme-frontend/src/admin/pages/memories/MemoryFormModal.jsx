import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/ui/Modal.jsx'
import { Input, Textarea } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ImageUploadField } from '../../components/ui/ImageUploadField.jsx'
import { ErrorAlert } from '../../components/ui/ErrorAlert.jsx'
import { extractErrorMessage } from '../../api/client.js'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  message: z.string().optional().or(z.literal('')),
  videoUrl: z.string().optional().or(z.literal('')),
  audioUrl: z.string().optional().or(z.literal('')),
  musicUrl: z.string().optional().or(z.literal('')),
  active: z.boolean(),
})

export function MemoryFormModal({ memory, onClose, onSubmit }) {
  const [mainImage, setMainImage] = useState(memory?.mainImage ?? null)
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: memory?.title ?? '',
      message: memory?.message ?? '',
      videoUrl: memory?.videoUrl ?? '',
      audioUrl: memory?.audioUrl ?? '',
      musicUrl: memory?.musicUrl ?? '',
      active: memory?.active ?? true,
    },
  })

  async function submit(values) {
    setServerError(null)
    try {
      await onSubmit({
        title: values.title,
        message: values.message || null,
        mainImage,
        gallery: memory?.gallery ?? [],
        videoUrl: values.videoUrl || null,
        audioUrl: values.audioUrl || null,
        musicUrl: values.musicUrl || null,
        active: values.active,
      })
    } catch (err) {
      setServerError(extractErrorMessage(err))
    }
  }

  return (
    <Modal title={memory ? 'Edit memory' : 'New memory'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {serverError && <ErrorAlert>{serverError}</ErrorAlert>}

        <ImageUploadField label="Main image" value={mainImage} onChange={setMainImage} />

        <Input label="Title" {...register('title')} error={errors.title?.message} />
        <Textarea label="Message" rows={3} {...register('message')} error={errors.message?.message} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Video URL" {...register('videoUrl')} error={errors.videoUrl?.message} placeholder="https://…" />
          <Input label="Audio URL" {...register('audioUrl')} error={errors.audioUrl?.message} placeholder="https://…" />
          <Input label="Music URL" {...register('musicUrl')} error={errors.musicUrl?.message} placeholder="https://…" />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('active')} />
          Active (publicly reachable)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {memory ? 'Save changes' : 'Create memory'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
