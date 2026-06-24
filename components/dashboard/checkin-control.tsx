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
import { checkInMember } from '@/app/actions/attendance'
import { LogIn } from 'lucide-react'

export function CheckinControl({
  members,
}: {
  members: { id: string; full_name: string }[]
}) {
  const [memberId, setMemberId] = useState('')
  const [isPending, startTransition] = useTransition()

  function onCheckIn() {
    if (!memberId) {
      toast.error('Select a member to check in')
      return
    }
    startTransition(async () => {
      const res = await checkInMember(memberId)
      if (res?.error) toast.error(res.error)
      else {
        toast.success('Checked in')
        setMemberId('')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={memberId} onValueChange={(val) => setMemberId(val ?? '')}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Select member">
            {members.find((m) => m.id === memberId)?.full_name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.full_name}
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
