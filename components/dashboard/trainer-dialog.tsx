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
import { createTrainer, updateTrainer } from '@/app/actions/trainers'
import type { Trainer } from '@/lib/types'
import { Plus } from 'lucide-react'

export function TrainerDialog({
  trainer,
  trigger,
  menuTrigger,
}: {
  trainer?: Trainer
  trigger?: React.ReactElement
  menuTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const editing = Boolean(trainer)

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editing
        ? await updateTrainer(trainer!.id, formData)
        : await createTrainer(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(editing ? 'Trainer updated' : 'Trainer added')
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
            <Plus className="size-4" /> Add Trainer
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Trainer' : 'Add Trainer'}</DialogTitle>
          <DialogDescription>
            Manage trainer details and specialization.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={trainer?.full_name}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={trainer?.email ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={trainer?.phone ?? ''}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              defaultValue={trainer?.specialization ?? ''}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={trainer?.bio ?? ''} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={trainer ? trainer.is_active : true}
              className="size-4 accent-[var(--primary)]"
            />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editing ? 'Save changes' : 'Add trainer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
