import { CheckinControl } from '@/components/dashboard/checkin-control'
import { AttendanceTable } from '@/components/dashboard/attendance-table'
import { TrainerCheckinControl } from '@/components/dashboard/trainer-checkin-control'
import { TrainerAttendanceTable } from '@/components/dashboard/trainer-attendance-table'
import {
  DashboardTopbar,
  MetricCard,
  MetricsGrid,
} from '@/components/dashboard/gym-ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  countAttendanceSince,
  listActiveMemberOptions,
  listAttendanceSince,
  listAttendanceWithMembers,
  listActiveTrainerOptions,
  listTrainerAttendanceWithTrainers,
} from '@/lib/cloudflare/d1'
import type { Attendance } from '@/lib/types'

function getPeakHour(records: Attendance[]) {
  const counts = new Map<number, number>()

  for (const record of records) {
    const hour = new Date(record.check_in).getHours()
    counts.set(hour, (counts.get(hour) ?? 0) + 1)
  }

  let peakHour = 7
  let peakCount = 0

  for (const [hour, count] of counts) {
    if (count > peakCount) {
      peakCount = count
      peakHour = hour
    }
  }

  if (peakCount === 0) return '—'

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    return `${h} ${ampm}`
  }

  return `${formatHour(peakHour)}–${formatHour(peakHour + 2)}`
}

export default async function AttendancePage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    records,
    memberList,
    todayCount,
    monthRecords,
    trainerRecords,
    trainerList,
  ] = await Promise.all([
    listAttendanceWithMembers(200),
    listActiveMemberOptions(),
    countAttendanceSince(todayStart.toISOString()),
    listAttendanceSince(monthStart.toISOString()),
    listTrainerAttendanceWithTrainers(200),
    listActiveTrainerOptions(),
  ])

  const daysInMonth = Math.max(
    1,
    Math.ceil((Date.now() - monthStart.getTime()) / (1000 * 60 * 60 * 24)),
  )
  const monthlyAvg = Math.round(monthRecords.length / daysInMonth)

  return (
    <div>
      <DashboardTopbar title="Attendance" />

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Member Check-ins</h2>
            <CheckinControl members={memberList} />
          </div>

          <MetricsGrid columns={3}>
            <MetricCard label="Check-ins today" value={todayCount} />
            <MetricCard label="Peak hour" value={getPeakHour(records)} />
            <MetricCard label="Monthly avg/day" value={monthlyAvg} />
          </MetricsGrid>

          <AttendanceTable records={records} />
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Trainer Check-ins</h2>
            <TrainerCheckinControl trainers={trainerList} />
          </div>

          <TrainerAttendanceTable records={trainerRecords} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
