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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClass, updateClass } from '@/app/actions/classes'
import type { GymClass, Trainer } from '@/lib/types'
import { Plus } from 'lucide-react'

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function ClassDialog({
  trainers,
  gymClass,
  trigger,
  menuTrigger,
}: {
  trainers: Pick<Trainer, 'id' | 'full_name'>[]
  gymClass?: GymClass
  trigger?: React.ReactElement
  menuTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [trainerId, setTrainerId] = useState(gymClass?.trainer_id ?? '')
  const [day, setDay] = useState(gymClass?.day_of_week ?? 'Monday')
  const [isPending, startTransition] = useTransition()
  const editing = Boolean(gymClass)

  function onSubmit(formData: FormData) {
    formData.set('trainer_id', trainerId)
    formData.set('day_of_week', day)
    startTransition(async () => {
      const res = editing
        ? await updateClass(gymClass!.id, formData)
        : await createClass(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(editing ? 'Class updated' : 'Class created')
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
            <Plus className="size-4" /> Add Class
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Class' : 'Add Class'}</DialogTitle>
          <DialogDescription>
            Schedule a class and assign a trainer.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Class name</Label>
            <Input id="name" name="name" required defaultValue={gymClass?.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={gymClass?.description ?? ''}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Trainer</Label>
              <Select value={trainerId} onValueChange={(val) => setTrainerId(val ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trainer">
                    {trainers.find((t) => t.id === trainerId)?.full_name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Day</Label>
              <Select value={day} onValueChange={(val) => setDay(val ?? '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={gymClass?.start_time ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">End</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={gymClass?.end_time ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                defaultValue={gymClass?.capacity ?? 20}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={gymClass ? gymClass.is_active : true}
              className="size-4 accent-[var(--primary)]"
            />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editing ? 'Save changes' : 'Add class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
