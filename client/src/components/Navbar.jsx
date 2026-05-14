import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import BrandMark from './BrandMark'

export default function Navbar() {
  // Top bar shows brand identity plus the current user and logout action.
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-orange-200/10 bg-[#090b10]/88 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandMark compact />
        <div className="flex items-center gap-3">
          <span className="hidden rounded-md border border-orange-200/10 bg-white/[0.03] px-3 py-2 text-sm text-orange-100/80 sm:inline">
            {user?.username}
          </span>
          <button
            type="button"
            onClick={logout}
            className="forge-button-subtle inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
