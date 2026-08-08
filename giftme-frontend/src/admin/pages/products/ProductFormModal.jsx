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

// Number fields are read via RHF's `valueAsNumber` (not z.coerce) so the schema's inferred
// type is a plain `number` - keeps the zodResolver's generic inference simple and avoids
// fighting zod v4's separate input/output types for coerced schemas.
const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  slug: z.string().trim().max(255).optional().or(z.literal('')),
  shortDescription: z.string().max(500).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must not be negative'),
  category: z.string().max(100).optional().or(z.literal('')),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock must not be negative'),
  customizationEnabled: z.boolean(),
  active: z.boolean(),
})

export function ProductFormModal({ product, onClose, onSubmit }) {
  const [mainImage, setMainImage] = useState(product?.mainImage ?? null)
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      shortDescription: product?.shortDescription ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      category: product?.category ?? '',
      stock: product?.stock ?? 0,
      customizationEnabled: product?.customizationEnabled ?? true,
      active: product?.active ?? true,
    },
  })

  async function submit(values) {
    setServerError(null)
    try {
      await onSubmit({
        name: values.name,
        slug: values.slug || null,
        shortDescription: values.shortDescription || null,
        description: values.description || null,
        price: values.price,
        category: values.category || null,
        stock: values.stock,
        customizationEnabled: values.customizationEnabled,
        active: values.active,
        mainImage,
      })
    } catch (err) {
      setServerError(extractErrorMessage(err))
    }
  }

  return (
    <Modal title={product ? 'Edit product' : 'New product'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {serverError && <ErrorAlert>{serverError}</ErrorAlert>}

        <ImageUploadField label="Main image" value={mainImage} onChange={setMainImage} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Slug (optional — auto-generated if blank)" {...register('slug')} error={errors.slug?.message} />
        </div>

        <Input label="Short description" {...register('shortDescription')} error={errors.shortDescription?.message} />
        <Textarea label="Description" rows={3} {...register('description')} error={errors.description?.message} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Price (MAD)"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            step="1"
            {...register('stock', { valueAsNumber: true })}
            error={errors.stock?.message}
          />
          <Input label="Category" {...register('category')} error={errors.category?.message} />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('customizationEnabled')} />
            Customization enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('active')} />
            Active (visible in the storefront)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
