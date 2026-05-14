import { BookOpen, ClipboardList, LayoutDashboard, NotebookPen, Timer } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/study-sessions', label: 'Study', icon: Timer },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="forge-card sticky top-24 space-y-2 rounded-lg p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-orange-500/15 text-orange-100 shadow-[inset_3px_0_0_rgba(248,177,45,0.9),0_0_24px_rgba(249,115,22,0.08)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-orange-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
