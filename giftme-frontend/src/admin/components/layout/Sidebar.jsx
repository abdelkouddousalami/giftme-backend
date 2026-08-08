import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, QrCode, Gift, Truck, X } from 'lucide-react'
import { paths } from '../../../app/paths.js'

const NAV_ITEMS = [
  { to: paths.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.admin.tracking, label: 'Tracking', icon: Truck },
  { to: paths.admin.products, label: 'Products', icon: Package },
  { to: paths.admin.orders, label: 'Orders', icon: ShoppingCart },
  { to: paths.admin.customers, label: 'Customers', icon: Users },
  { to: paths.admin.memories, label: 'QR Memories', icon: QrCode },
]

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
          <Gift size={18} />
        </div>
        <span className="text-base font-semibold text-black">GiftMe Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-end px-3 pt-3">
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  )
}
