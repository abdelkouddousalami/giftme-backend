import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalElements === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
      <span>
        Page {page + 1} of {Math.max(totalPages, 1)} · {totalElements} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
