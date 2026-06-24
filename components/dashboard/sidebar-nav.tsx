'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Dumbbell,
  CalendarDays,
  Settings,
} from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/members', label: 'Members', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/dashboard/trainers', label: 'Trainers', icon: Dumbbell },
  { href: '/dashboard/classes', label: 'Classes', icon: CalendarDays },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col py-4">
      <div className="px-4 pb-3 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        Zentrix
      </div>
      <div className="flex flex-col">
        {links.slice(0, -1).map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 border-l-2 px-4 py-2 text-sm transition-colors',
                active
                  ? 'border-[#185FA5] bg-muted text-[#185FA5]'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="mt-auto border-t border-border/80 px-4 pt-3">
        {(() => {
          const { href, label, icon: Icon } = links[links.length - 1]
          const active = pathname.startsWith(href)

          return (
            <Link
              href={href}
              className={cn(
                'flex items-center gap-2.5 border-l-2 py-2 text-sm transition-colors',
                active
                  ? 'border-[#185FA5] bg-muted text-[#185FA5]'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
            </Link>
          )
        })()}
      </div>
    </nav>
  )
}
