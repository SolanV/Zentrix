'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createPlan, updatePlan } from '@/app/actions/plans'
import type { MembershipPlan } from '@/lib/types'
import { Plus } from 'lucide-react'

export function PlanDialog({
  plan,
  trigger,
  menuTrigger,
}: {
  plan?: MembershipPlan
  trigger?: React.ReactElement
  menuTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const editing = Boolean(plan)

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editing
        ? await updatePlan(plan!.id, formData)
        : await createPlan(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(editing ? 'Plan updated' : 'Plan created')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={menuTrigger ? false : undefined}
        render={trigger ?? <Button className="gap-2" />}
      >
        {!trigger && (
          <>
            <Plus className="size-4" /> Add Plan
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
          <DialogDescription>
            Define the membership plan details and pricing.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Plan name</Label>
            <Input id="name" name="name" required defaultValue={plan?.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={plan?.description ?? ''}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (INR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={plan?.price ?? 0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration_days">Duration (days)</Label>
              <Input
                id="duration_days"
                name="duration_days"
                type="number"
                min="1"
                required
                defaultValue={plan?.duration_days ?? 30}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={plan ? plan.is_active : true}
              className="size-4 accent-[var(--primary)]"
            />
            Active (available for new members)
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editing ? 'Save changes' : 'Add plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
