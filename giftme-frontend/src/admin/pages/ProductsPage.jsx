import { useEffect, useState } from 'react'
import { Download, Package, Plus, Search } from 'lucide-react'
import { createProduct, deleteProduct, listProducts, setProductStatus, updateProduct } from '../api/products.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { ErrorAlert } from '../components/ui/ErrorAlert.jsx'
import { ProductFormModal } from './products/ProductFormModal.jsx'
import { formatCurrency, formatDate } from '../lib/format.js'
import { downloadCsv } from '../lib/csv.js'
import { extractErrorMessage } from '../api/client.js'
import { resolveMediaUrl } from '../lib/media.js'

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editingProduct, setEditingProduct] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listProducts({ page, search: search || undefined })
      setProducts(result.content)
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

  function handleSearchSubmit(e) {
    e.preventDefault()
    setPage(0)
    load()
  }

  async function handleCreate(request) {
    await createProduct(request)
    setShowCreateModal(false)
    load()
  }

  async function handleUpdate(request) {
    if (!editingProduct) return
    await updateProduct(editingProduct.id, request)
    setEditingProduct(null)
    load()
  }

  async function handleToggleStatus(product) {
    setActionError(null)
    setTogglingId(product.id)
    try {
      await setProductStatus(product.id, !product.active)
      load()
    } catch (err) {
      setActionError(extractErrorMessage(err))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete() {
    if (!productToDelete) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteProduct(productToDelete.id)
      setProductToDelete(null)
      load()
    } catch (err) {
      setActionError(extractErrorMessage(err))
      setProductToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleExportCsv() {
    downloadCsv('giftme-products', products, [
      { header: 'ID', accessor: (p) => p.id },
      { header: 'Name', accessor: (p) => p.name },
      { header: 'Slug', accessor: (p) => p.slug },
      { header: 'Category', accessor: (p) => p.category ?? '' },
      { header: 'Price', accessor: (p) => p.price },
      { header: 'Stock', accessor: (p) => p.stock },
      { header: 'Active', accessor: (p) => (p.active ? 'Yes' : 'No') },
      { header: 'Created', accessor: (p) => p.createdAt },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage the catalog — create, edit, activate/deactivate.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportCsv} disabled={products.length === 0}>
            Export CSV
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            New product
          </Button>
        </div>
      </div>

      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={40} />}
            title="No products found"
            description={search ? 'Try a different search term.' : 'Create your first product to get started.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {product.mainImage && (
                              <img src={resolveMediaUrl(product.mainImage)} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{product.category ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{formatCurrency(product.price)}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {product.stock === 0 ? <Badge tone="warning">Out of stock</Badge> : product.stock}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={product.active ? 'success' : 'default'}>{product.active ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(product.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setEditingProduct(product)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            isLoading={togglingId === product.id}
                            onClick={() => handleToggleStatus(product)}
                          >
                            {product.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="ghost" onClick={() => setProductToDelete(product)}>
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

      {showCreateModal && (
        <ProductFormModal product={null} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
      )}
      {editingProduct && (
        <ProductFormModal product={editingProduct} onClose={() => setEditingProduct(null)} onSubmit={handleUpdate} />
      )}
      {productToDelete && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${productToDelete.name}"? This can't be undone. If it has order history, deletion will be blocked — deactivate it instead.`}
          confirmLabel="Delete"
          danger
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </div>
  )
}
