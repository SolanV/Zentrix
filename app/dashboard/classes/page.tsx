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
import { MoreHorizontal, Pencil } from 'lucide-react'
import { ClassDialog } from '@/components/dashboard/class-dialog'
import { DeleteMenuItem } from '@/components/dashboard/delete-button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { DashboardTopbar } from '@/components/dashboard/gym-ui'
import { deleteClass } from '@/app/actions/classes'
import { listActiveTrainerOptions, listClassesWithRelations } from '@/lib/cloudflare/d1'
import type { GymClass } from '@/lib/types'

function formatTime(timeStr: string | null) {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  let hour = parseInt(parts[0], 10)
  const minute = parts[1]
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  hour = hour ? hour : 12
  return `${hour}:${minute} ${ampm}`
}

function formatSchedule(day: string | null, startTime: string | null) {
  if (!day || !startTime) return '—'
  return `${day}s at ${formatTime(startTime)}`
}

export default async function ClassesPage() {
  const [classList, trainerList] = await Promise.all([
    listClassesWithRelations(),
    listActiveTrainerOptions(),
  ])

  return (
    <div>
      <DashboardTopbar title="Classes">
        <ClassDialog trainers={trainerList} />
      </DashboardTopbar>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Class
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Trainer
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Schedule
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Capacity
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Enrolled
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No classes scheduled yet. Add your first class to get started.
                </TableCell>
              </TableRow>
            ) : (
              classList.map((c) => {
                const gymClass = c as GymClass & {
                  trainers?: { full_name?: string } | null
                  class_bookings?: { id: string }[] | null
                }
                const enrolled = gymClass.class_bookings?.length ?? 0
                const capacity = gymClass.capacity ?? 20
                const trainerName = gymClass.trainers?.full_name ?? '—'

                let status = 'active'
                let statusLabel = 'Running'
                if (!gymClass.is_active) {
                  status = 'pending'
                  statusLabel = 'Paused'
                } else if (enrolled >= capacity) {
                  status = 'booked'
                  statusLabel = 'Full'
                }

                return (
                  <TableRow key={gymClass.id} className="hover:bg-muted/50">
                    <TableCell className="px-4 font-medium">{gymClass.name}</TableCell>
                    <TableCell>{trainerName}</TableCell>
                    <TableCell>
                      {formatSchedule(gymClass.day_of_week, gymClass.start_time)}
                    </TableCell>
                    <TableCell>{capacity}</TableCell>
                    <TableCell>{enrolled}</TableCell>
                    <TableCell>
                      <StatusBadge status={status}>{statusLabel}</StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="outline" size="sm" className="h-7 text-xs" />
                          }
                        >
                          Manage
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DeleteMenuItem id={gymClass.id} action={deleteClass} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
