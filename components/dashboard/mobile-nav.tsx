'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/members', label: 'Members' },
  { href: '/dashboard/payments', label: 'Payments' },
  { href: '/dashboard/attendance', label: 'Attendance' },
  { href: '/dashboard/trainers', label: 'Trainers' },
  { href: '/dashboard/classes', label: 'Classes' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/80 px-4 py-2 md:hidden">
      {links.map(({ href, label }) => {
        const active =
          href === '/dashboard' ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-[#185FA5] text-white'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
