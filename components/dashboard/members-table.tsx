'use client'

import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Pencil, MessageSquare } from 'lucide-react'
import { MemberDialog } from '@/components/dashboard/member-dialog'
import { DeleteMenuItem } from '@/components/dashboard/delete-button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { MemberCell } from '@/components/dashboard/gym-ui'
import { PromptButton } from '@/components/dashboard/prompt-button'
import { formatShortDate } from '@/lib/format'
import { deleteMember } from '@/app/actions/members'
import type { Member, MembershipPlan } from '@/lib/types'

function normalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function MembersTable({
  members,
  plans,
}: {
  members: Member[]
  plans: Pick<MembershipPlan, 'id' | 'name'>[]
}) {
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const planNames = useMemo(
    () => [...new Set(members.map((m) => m.membership_plans?.name).filter(Boolean))],
    [members],
  )

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        m.full_name.toLowerCase().includes(q) ||
        (m.phone ?? '').toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q)
      const matchesPlan =
        planFilter === 'all' || m.membership_plans?.name === planFilter
      const matchesStatus =
        statusFilter === 'all' || normalizeStatus(m.status) === statusFilter

      return matchesQuery && matchesPlan && matchesStatus
    })
  }, [members, query, planFilter, statusFilter])

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, email…"
          className="h-9 flex-1 text-[13px]"
        />
        <Select value={planFilter} onValueChange={(val) => setPlanFilter(val ?? '')}>
          <SelectTrigger className="h-9 w-full sm:w-40 text-[13px]">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {planNames.map((name) => (
              <SelectItem key={name} value={name!}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? '')}>
          <SelectTrigger className="h-9 w-full sm:w-40 text-[13px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Frozen">Frozen</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Plan
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Joined
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Expiry
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No members match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/50">
                  <TableCell className="px-4">
                    <MemberCell name={m.full_name} />
                  </TableCell>
                  <TableCell>{m.phone || '—'}</TableCell>
                  <TableCell>{m.membership_plans?.name ?? '—'}</TableCell>
                  <TableCell>{formatShortDate(m.created_at)}</TableCell>
                  <TableCell>{formatShortDate(m.membership_end)}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PromptButton
                        prompt={`Show member profile and full history for ${m.full_name} at Zentrix gym`}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                      >
                        View ↗
                      </PromptButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8" />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setTimeout(() => {
                                setEditingMember(m)
                              }, 16)
                            }}
                          >
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              const message = `Hello ${m.full_name}, your Fitness World membership expires on ${m.membership_end || 'N/A'}. Please renew your membership to continue enjoying our services.`
                              let cleanPhone = m.phone ? m.phone.replace(/[^\d]/g, '') : ''
                              if (cleanPhone.length === 10) {
                                cleanPhone = `91${cleanPhone}`
                              }
                              const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
                              window.open(whatsappUrl, '_blank')
                            }}
                          >
                            <MessageSquare className="size-4 text-emerald-500" /> Send Reminder
                          </DropdownMenuItem>
                          <DeleteMenuItem id={m.id} action={deleteMember} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {editingMember && (
        <MemberDialog
          plans={plans}
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open) => {
            if (!open) setEditingMember(null)
          }}
        />
      )}
    </>
  )
}
