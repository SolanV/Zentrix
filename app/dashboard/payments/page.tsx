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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { PaymentDialog } from '@/components/dashboard/payment-dialog'
import { PaymentStatusItems } from '@/components/dashboard/payment-status-action'
import { DeleteMenuItem } from '@/components/dashboard/delete-button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  DashboardTopbar,
  MemberCell,
  MetricCard,
  MetricsGrid,
} from '@/components/dashboard/gym-ui'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { deletePayment } from '@/app/actions/payments'
import { listMemberOptions, listPaymentsWithRelations } from '@/lib/cloudflare/d1'

export default async function PaymentsPage() {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [paymentList, memberList] = await Promise.all([
    listPaymentsWithRelations(),
    listMemberOptions(),
  ])

  const monthPayments = paymentList.filter(
    (p) => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= monthStart,
  )
  const totalCollected = monthPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  )
  const outstanding = paymentList
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div>
      <DashboardTopbar title="Payments">
        <PaymentDialog members={memberList} />
      </DashboardTopbar>

      <MetricsGrid columns={3}>
        <MetricCard
          label="Collected this month"
          value={formatCurrency(totalCollected)}
        />
        <MetricCard
          label="Pending"
          value={formatCurrency(outstanding)}
          valueClassName="text-[#A32D2D]"
        />
        <MetricCard label="Transactions" value={paymentList.length} />
      </MetricsGrid>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Plan
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Mode
              </TableHead>
              <TableHead className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No payments recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              paymentList.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="px-4">
                    <MemberCell name={p.members?.full_name ?? 'Unknown'} />
                  </TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{p.membership_plans?.name ?? '—'}</TableCell>
                  <TableCell>
                    {formatShortDate(p.paid_at ?? p.created_at)}
                  </TableCell>
                  <TableCell>{p.method ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
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
                        <PaymentStatusItems id={p.id} />
                        <DropdownMenuSeparator />
                        <DeleteMenuItem id={p.id} action={deletePayment} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
