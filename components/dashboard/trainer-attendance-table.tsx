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
import { TrainerCheckoutButton } from '@/components/dashboard/trainer-checkout-button'
import { PromptButton } from '@/components/dashboard/prompt-button'
import { MemberCell } from '@/components/dashboard/gym-ui'
import { formatDuration, formatTimeOfDay } from '@/lib/format'
import type { TrainerAttendance } from '@/lib/types'

export function TrainerAttendanceTable({ records }: { records: TrainerAttendance[] }) {
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
          prompt={`Show trainer attendance summary and trends for Zentrix gym for ${new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}
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
                Trainer
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
                  No trainer attendance records for this date.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/50">
                  <TableCell className="px-4">
                    <MemberCell name={r.trainers?.full_name ?? '—'} />
                  </TableCell>
                  <TableCell>{formatTimeOfDay(r.check_in)}</TableCell>
                  <TableCell>{formatTimeOfDay(r.check_out)}</TableCell>
                  <TableCell>{formatDuration(r.check_in, r.check_out)}</TableCell>
                  <TableCell className="text-right">
                    {!r.check_out && <TrainerCheckoutButton id={r.id} />}
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
