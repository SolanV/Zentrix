'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { checkOutTrainer } from '@/app/actions/trainer-attendance'
import { LogOut } from 'lucide-react'

export function TrainerCheckoutButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function onCheckOut() {
    startTransition(async () => {
      const res = await checkOutTrainer(id)
      if (res?.error) toast.error(res.error)
      else toast.success('Checked out')
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onCheckOut}
      disabled={isPending}
      className="h-8 gap-1.5 text-xs"
    >
      <LogOut className="size-3.5" /> Check Out
    </Button>
  )
}
