import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatShortDate,
} from '@/lib/format'
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { RemindButton } from '@/components/dashboard/remind-button'
import {
  CapacityBar,
  DashboardTopbar,
  GymCard,
  MemberCell,
  MetricCard,
  MetricsGrid,
  StatRow,
  TrendDown,
  TrendUp,
} from '@/components/dashboard/gym-ui'
import { getDashboardData } from '@/lib/cloudflare/d1'

export default async function DashboardOverview() {
  const {
    activeCount,
    checkinsTodayCount,
    checkinsYesterdayCount,
    membersByPlan,
    overdueCount,
    paidLastMonth,
    paidThisMonth,
    recentCheckins,
    recentClasses,
    recentMembers,
    recentPayments,
    registeredMonthCount,
    todayStart,
    totalCount,
    upcomingRenewals,
  } = await getDashboardData()

  const monthRevenue = paidThisMonth.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  )
  const lastMonthRevenue = paidLastMonth.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  )
  const revenueChange =
    lastMonthRevenue > 0
      ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null

  const checkinsDiff = checkinsTodayCount - checkinsYesterdayCount

  const overduePercent =
    totalCount > 0 ? ((overdueCount / totalCount) * 100).toFixed(1) : '0'

  const planCounts = membersByPlan.reduce(
    (acc: Record<string, number>, m: { membership_plans?: { name?: string } | null }) => {
      const planName = m.membership_plans?.name || 'No Plan'
      acc[planName] = (acc[planName] || 0) + 1
      return acc
    },
    {},
  )

  const activities: {
    id: string
    time: Date
    text: string
    when: string
  }[] = []

  for (const c of recentCheckins) {
    const member = c.members as { full_name?: string } | null
    activities.push({
      id: `checkin-${c.id}`,
      time: new Date(c.check_in),
      text: `${member?.full_name ?? 'Member'} checked in`,
      when: formatRelativeTime(c.check_in),
    })
  }

  for (const p of recentPayments) {
    const member = p.members as { full_name?: string } | null
    activities.push({
      id: `payment-${p.id}`,
      time: new Date(p.created_at),
      text: `${member?.full_name ?? 'Member'} — payment received ${formatCurrency(p.amount)}`,
      when: formatRelativeTime(p.created_at),
    })
  }

  for (const m of recentMembers) {
    activities.push({
      id: `member-${m.id}`,
      time: new Date(m.created_at),
      text: `New member: ${m.full_name}`,
      when: formatRelativeTime(m.created_at),
    })
  }

  for (const c of recentClasses) {
    const trainer = c.trainers as { full_name?: string } | null
    activities.push({
      id: `class-${c.id}`,
      time: new Date(c.updated_at),
      text: `Trainer ${trainer?.full_name ?? 'Staff'} updated ${c.name}`,
      when: formatRelativeTime(c.updated_at),
    })
  }

  activities.sort((a, b) => b.time.getTime() - a.time.getTime())
  const sortedActivities = activities.slice(0, 5)

  const currentMonthYear = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <h1 className="sr-only">
        Zentrix Admin Dashboard — manage members, payments, trainers,
        attendance, and reports
      </h1>

      <DashboardTopbar title="Overview">
        <span className="text-[13px] text-muted-foreground">{currentMonthYear}</span>
      </DashboardTopbar>

      <MetricsGrid>
        <MetricCard
          label="Total members"
          value={totalCount}
          sub={
            <TrendUp>
              <TrendingUp className="mr-1 inline size-3" />+{registeredMonthCount} this month
            </TrendUp>
          }
        />
        <MetricCard
          label={`Revenue (${new Date().toLocaleDateString('en-IN', { month: 'long' })})`}
          value={formatCurrency(monthRevenue)}
          sub={
            revenueChange !== null ? (
              revenueChange >= 0 ? (
                <TrendUp>
                  <TrendingUp className="mr-1 inline size-3" />+{revenueChange}% vs last month
                </TrendUp>
              ) : (
                <TrendDown>
                  <TrendingDown className="mr-1 inline size-3" />
                  {revenueChange}% vs last month
                </TrendDown>
              )
            ) : (
              <span>Collected this month</span>
            )
          }
        />
        <MetricCard
          label="Check-ins today"
          value={checkinsTodayCount}
          sub={
            checkinsDiff >= 0 ? (
              <TrendUp>
                <TrendingUp className="mr-1 inline size-3" />+{checkinsDiff} vs yesterday
              </TrendUp>
            ) : (
              <TrendDown>
                <TrendingDown className="mr-1 inline size-3" />
                {checkinsDiff} vs yesterday
              </TrendDown>
            )
          }
        />
        <MetricCard
          label="Overdue payments"
          value={overdueCount}
          sub={
            <TrendDown>
              <AlertTriangle className="mr-1 inline size-3" />
              {overduePercent}% of members
            </TrendDown>
          }
        />
      </MetricsGrid>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GymCard title="Membership breakdown">
          {Object.keys(planCounts).length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No active membership plans assigned.
            </p>
          ) : (
            Object.entries(planCounts).map(([planName, count]) => (
              <StatRow key={planName} label={planName} value={count} />
            ))
          )}
          <CapacityBar filled={activeCount} total={400} />
        </GymCard>

        <GymCard title="Recent activity">
          {sortedActivities.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No recent activities recorded.
            </p>
          ) : (
            sortedActivities.map((act) => (
              <StatRow
                key={act.id}
                label={act.text}
                value={act.when}
                valueClassName="text-xs font-normal text-muted-foreground"
              />
            ))
          )}
        </GymCard>
      </div>

      <GymCard title="Upcoming renewals (next 7 days)" className="mb-0 p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Plan
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Expiry
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcomingRenewals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No memberships expiring in the next 7 days.
                </TableCell>
              </TableRow>
            ) : (
              upcomingRenewals.map((row) => {
                const daysUntilExpiry = row.membership_end
                  ? Math.ceil(
                      (new Date(row.membership_end).getTime() - todayStart.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 99
                const status =
                  daysUntilExpiry <= 3 ? 'pending' : 'active'

                return (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    <TableCell className="px-4">
                      <MemberCell name={row.full_name} />
                    </TableCell>
                    <TableCell>{row.membership_plans?.name ?? '—'}</TableCell>
                    <TableCell>{formatShortDate(row.membership_end)}</TableCell>
                    <TableCell>
                      <StatusBadge status={status}>
                        {daysUntilExpiry <= 3 ? 'Expiring soon' : 'Active'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <RemindButton
                        memberName={row.full_name}
                        expiryDate={formatDate(row.membership_end)}
                        phone={row.phone}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </GymCard>
    </div>
  )
}
