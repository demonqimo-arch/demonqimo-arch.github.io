import { CalendarDays, CalendarRange, LayoutGrid, ListChecks, Sun } from 'lucide-react'
import { NavLink, useSearchParams } from 'react-router-dom'

const TABS = [
  { to: '/day', label: '日', icon: Sun },
  { to: '/week', label: '周', icon: CalendarDays },
  { to: '/month', label: '月', icon: LayoutGrid },
  { to: '/year', label: '年', icon: CalendarRange },
  { to: '/all', label: '全部', icon: ListChecks },
]

export function BottomNav() {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-2.5">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={query ? `${to}?${query}` : to}
            className={({ isActive }) =>
              `flex min-w-13 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'bg-accent-soft text-accent' : 'text-ink-muted'
              }`
            }
          >
            <Icon size={19} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
