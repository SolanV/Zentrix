'use client'

import { useTransition } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { CheckCircle2, Clock } from 'lucide-react'
import { updatePaymentStatus } from '@/app/actions/payments'

export function PaymentStatusItems({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function set(status: string) {
    startTransition(async () => {
      const res = await updatePaymentStatus(id, status)
      if (res?.error) toast.error(res.error)
      else toast.success('Payment updated')
    })
  }

  return (
    <>
      <DropdownMenuItem
        disabled={isPending}
        className="gap-2"
        onClick={() => set('paid')}
      >
        <CheckCircle2 className="size-4" /> Mark paid
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={isPending}
        className="gap-2"
        onClick={() => set('pending')}
      >
        <Clock className="size-4" /> Mark pending
      </DropdownMenuItem>
    </>
  )
}
