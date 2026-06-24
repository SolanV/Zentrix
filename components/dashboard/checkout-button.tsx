'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { checkOutMember } from '@/app/actions/attendance'

export function CheckoutButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      className="gap-1.5"
      onClick={() =>
        startTransition(async () => {
          const res = await checkOutMember(id)
          if (res?.error) toast.error(res.error)
          else toast.success('Checked out')
        })
      }
    >
      <LogOut className="size-3.5" /> Check out
    </Button>
  )
}
