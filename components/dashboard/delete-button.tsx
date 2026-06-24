'use client'

import { useTransition } from 'react'
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function DeleteMenuItem({
  id,
  action,
  label = 'Delete',
  confirmText = 'Are you sure you want to delete this? This cannot be undone.',
}: {
  id: string
  action: (id: string) => Promise<{ error?: string } | { success: boolean }>
  label?: string
  confirmText?: string
}) {
  const [isPending, startTransition] = useTransition()

  function onDelete() {
    if (!confirm(confirmText)) return
    startTransition(async () => {
      const res = await action(id)
      if (res && 'error' in res && res.error) {
        toast.error(res.error)
      } else {
        toast.success('Deleted')
      }
    })
  }

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={isPending}
      onClick={onDelete}
      className="gap-2"
    >
      <Trash2 className="size-4" />
      {label}
    </DropdownMenuItem>
  )
}
