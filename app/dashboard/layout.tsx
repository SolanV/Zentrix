import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { SignOutButton } from '@/components/dashboard/sign-out-button'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-[200px] shrink-0 flex-col border-r border-border/80 bg-background md:flex">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/80 px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-foreground md:hidden">
            Zentrix
          </span>
          <span className="hidden text-sm text-muted-foreground md:block">
            {user.email}
          </span>
          <SignOutButton />
        </header>
        <MobileNav />
        <main className="flex-1 overflow-x-hidden px-4 py-4 md:px-6 md:py-4">
          {children}
        </main>
      </div>
    </div>
  )
}
