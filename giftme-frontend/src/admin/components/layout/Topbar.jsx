import { LogOut, Menu, User } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
            <User size={14} />
          </span>
          <span className="hidden sm:inline">{user?.fullName ?? user?.email}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
