import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { TrainerDialog } from '@/components/dashboard/trainer-dialog'
import { DeleteMenuItem } from '@/components/dashboard/delete-button'
import { PromptButton } from '@/components/dashboard/prompt-button'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  DashboardTopbar,
  GymCard,
  MemberAvatar,
  StatRow,
} from '@/components/dashboard/gym-ui'
import { deleteTrainer } from '@/app/actions/trainers'
import { listTrainersWithClassCount } from '@/lib/cloudflare/d1'
import type { Trainer } from '@/lib/types'

export default async function TrainersPage() {
  const trainers = (await listTrainersWithClassCount()) as (Trainer & {
    classes?: { id: string }[]
  })[]

  return (
    <div>
      <DashboardTopbar title="Trainers">
        <TrainerDialog />
      </DashboardTopbar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {trainers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trainers yet.</p>
        ) : (
          trainers.map((t) => {
            const classCount = t.classes?.length ?? 0

            return (
              <GymCard key={t.id} className="mb-0">
                <div className="mb-3 flex items-center gap-3">
                  <MemberAvatar name={t.full_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium text-foreground">
                      {t.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.specialization ?? 'General fitness'}
                    </div>
                  </div>
                  <StatusBadge
                    status={t.is_active ? 'active' : 'pending'}
                  >
                    {t.is_active ? 'Active' : 'On leave'}
                  </StatusBadge>
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
                      <DeleteMenuItem id={t.id} action={deleteTrainer} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <StatRow label="Classes assigned" value={classCount} />
                <StatRow
                  label="Contact"
                  value={t.phone ?? t.email ?? '—'}
                  valueClassName="font-normal text-muted-foreground"
                />
                <StatRow
                  label="Status"
                  value={t.is_active ? 'Available' : 'Unavailable'}
                />
                <div className="mt-2.5 flex gap-2">
                  <TrainerDialog
                    trainer={t}
                    trigger={
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Edit
                      </Button>
                    }
                  />
                  <PromptButton
                    prompt={`Show full profile and schedule for trainer ${t.full_name} at Zentrix gym`}
                    className="h-7 text-xs"
                  >
                    View schedule ↗
                  </PromptButton>
                </div>
              </GymCard>
            )
          })
        )}
      </div>
    </div>
  )
}
