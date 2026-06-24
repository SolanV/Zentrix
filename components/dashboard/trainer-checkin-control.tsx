'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { checkInTrainer } from '@/app/actions/trainer-attendance'
import { LogIn } from 'lucide-react'

export function TrainerCheckinControl({
  trainers,
}: {
  trainers: { id: string; full_name: string }[]
}) {
  const [trainerId, setTrainerId] = useState('')
  const [isPending, startTransition] = useTransition()

  function onCheckIn() {
    if (!trainerId) {
      toast.error('Select a trainer to check in')
      return
    }
    startTransition(async () => {
      const res = await checkInTrainer(trainerId)
      if (res?.error) toast.error(res.error)
      else {
        toast.success('Trainer checked in')
        setTrainerId('')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={trainerId} onValueChange={(val) => setTrainerId(val ?? '')}>
        <SelectTrigger className="w-56">
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
      <Button onClick={onCheckIn} disabled={isPending} className="gap-2">
        <LogIn className="size-4" /> Check In
      </Button>
    </div>
  )
}
