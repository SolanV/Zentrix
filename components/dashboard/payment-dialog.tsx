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
import { createPayment } from '@/app/actions/payments'
import { Plus } from 'lucide-react'

const statuses = ['pending', 'paid', 'overdue', 'cancelled']
const methods = ['Cash', 'UPI', 'Card', 'Bank Transfer']

export function PaymentDialog({
  members,
}: {
  members: { id: string; full_name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [memberId, setMemberId] = useState('')
  const [status, setStatus] = useState('paid')
  const [method, setMethod] = useState('Cash')
  const [isPending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    if (!memberId) {
      toast.error('Please select a member')
      return
    }
    formData.set('member_id', memberId)
    formData.set('status', status)
    formData.set('method', method)
    startTransition(async () => {
      const res = await createPayment(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Payment recorded')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" /> Record Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Create an invoice / payment record for a member.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Member</Label>
            <Select value={memberId} onValueChange={(val) => setMemberId(val ?? '')}>
              <SelectTrigger>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val ?? '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(val) => setMethod(val ?? '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
