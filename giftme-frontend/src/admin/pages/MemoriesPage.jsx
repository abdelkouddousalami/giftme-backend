import { useEffect, useState } from 'react'
import { ExternalLink, Plus, QrCode } from 'lucide-react'
import { createMemory, deleteMemory, listMemories, updateMemory } from '../api/memories.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { ErrorAlert } from '../components/ui/ErrorAlert.jsx'
import { MemoryFormModal } from './memories/MemoryFormModal.jsx'
import { formatDate } from '../lib/format.js'
import { extractErrorMessage } from '../api/client.js'
import { resolveMediaUrl } from '../lib/media.js'

export function MemoriesPage() {
  const [memories, setMemories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editingMemory, setEditingMemory] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listMemories(page)
      setMemories(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handleCreate(request) {
    await createMemory(request)
    setShowCreateModal(false)
    load()
  }

  async function handleUpdate(request) {
    if (!editingMemory) return
    await updateMemory(editingMemory.id, request)
    setEditingMemory(null)
    load()
  }

  async function handleDelete() {
    if (!memoryToDelete) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteMemory(memoryToDelete.id)
      setMemoryToDelete(null)
      load()
    } catch (err) {
      setActionError(extractErrorMessage(err))
      setMemoryToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">QR Memories</h1>
          <p className="text-sm text-slate-500">
            Manage memory pages — generated automatically from QR orders, or created here directly.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          New memory
        </Button>
      </div>

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : memories.length === 0 ? (
          <EmptyState icon={<QrCode size={40} />} title="No memories yet" description="Memories are created here or automatically when a QR order is placed." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Memory</th>
                    <th className="px-5 py-3 font-medium">Public code</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memories.map((memory) => (
                    <tr key={memory.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {memory.mainImage && (
                              <img src={resolveMediaUrl(memory.mainImage)} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <p className="font-medium text-slate-800">{memory.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <a
                          href={memory.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-black underline"
                        >
                          {memory.publicCode} <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={memory.active ? 'success' : 'default'}>{memory.active ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(memory.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setEditingMemory(memory)}>
                            Edit
                          </Button>
                          <Button variant="ghost" onClick={() => setMemoryToDelete(memory)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showCreateModal && <MemoryFormModal memory={null} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />}
      {editingMemory && (
        <MemoryFormModal memory={editingMemory} onClose={() => setEditingMemory(null)} onSubmit={handleUpdate} />
      )}
      {memoryToDelete && (
        <ConfirmDialog
          title="Delete memory"
          message={`Delete "${memoryToDelete.title}"? Its public page will stop working immediately.`}
          confirmLabel="Delete"
          danger
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setMemoryToDelete(null)}
        />
      )}
    </div>
  )
}
