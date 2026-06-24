import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { PlanDialog } from '@/components/dashboard/plan-dialog'
import { DeleteMenuItem } from '@/components/dashboard/delete-button'
import { DashboardTopbar, GymCard, StatRow } from '@/components/dashboard/gym-ui'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { formatCurrency } from '@/lib/format'
import { deletePlan } from '@/app/actions/plans'
import { listPlans } from '@/lib/cloudflare/d1'

export default async function PlansPage() {
  const plans = await listPlans()

  return (
    <div>
      <DashboardTopbar title="Membership plans">
        <PlanDialog />
      </DashboardTopbar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plans yet.</p>
        ) : (
          plans.map((p) => (
            <GymCard key={p.id} className="mb-0">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-medium text-foreground">
                    {p.name}
                  </div>
                  <div className="mt-1 text-2xl font-medium text-[#185FA5]">
                    {formatCurrency(p.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
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
                      <DeleteMenuItem id={p.id} action={deletePlan} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <StatRow label="Duration" value={`${p.duration_days} days`} />
              {p.description ? (
                <StatRow
                  label="Description"
                  value={p.description}
                  valueClassName="max-w-[220px] truncate font-normal text-muted-foreground"
                />
              ) : null}
            </GymCard>
          ))
        )}
      </div>
    </div>
  )
}
