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
import { Input } from '@/components/ui/input'
import { CheckoutButton } from '@/components/dashboard/checkout-button'
import { PromptButton } from '@/components/dashboard/prompt-button'
import { MemberCell } from '@/components/dashboard/gym-ui'
import { formatDuration, formatTimeOfDay } from '@/lib/format'
import type { Attendance } from '@/lib/types'

export function AttendanceTable({ records }: { records: Attendance[] }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const filtered = useMemo(() => {
    return records.filter((r) => r.check_in.slice(0, 10) === date)
  }, [records, date])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 w-auto text-[13px]"
        />
        <PromptButton
          prompt={`Show attendance summary and trends for Zentrix gym for ${new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}
          className="text-[13px]"
        >
          Full report ↗
        </PromptButton>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Check-in
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Check-out
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="w-28 text-right text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No attendance records for this date.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/50">
                  <TableCell className="px-4">
                    <MemberCell name={r.members?.full_name ?? '—'} />
                  </TableCell>
                  <TableCell>{formatTimeOfDay(r.check_in)}</TableCell>
                  <TableCell>{formatTimeOfDay(r.check_out)}</TableCell>
                  <TableCell>{formatDuration(r.check_in, r.check_out)}</TableCell>
                  <TableCell className="text-right">
                    {!r.check_out && <CheckoutButton id={r.id} />}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
