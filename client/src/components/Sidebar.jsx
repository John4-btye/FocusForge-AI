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
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-700 hover:bg-white hover:text-slate-950'
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
