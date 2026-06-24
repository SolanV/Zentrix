'use client'

import { useState, useTransition, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createMember, updateMember } from '@/app/actions/members'
import type { Member, MembershipPlan } from '@/lib/types'
import { Plus } from 'lucide-react'

const statuses = ['active', 'inactive', 'expired', 'frozen']

export function MemberDialog({
  plans,
  member,
  trigger,
  menuTrigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  plans: Pick<MembershipPlan, 'id' | 'name'>[]
  member?: Member
  trigger?: React.ReactElement
  menuTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : localOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen

  const [planId, setPlanId] = useState(member?.plan_id ?? '')
  const [status, setStatus] = useState(member?.status ?? 'active')

  useEffect(() => {
    setPlanId(member?.plan_id ?? '')
    setStatus(member?.status ?? 'active')
  }, [member])
  const [isPending, startTransition] = useTransition()
  const editing = Boolean(member)

  function onSubmit(formData: FormData) {
    formData.set('plan_id', planId)
    formData.set('status', status)
    startTransition(async () => {
      const res = editing
        ? await updateMember(member!.id, formData)
        : await createMember(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(editing ? 'Member updated' : 'Member added')
        setOpen(false)

        // If newly created member has a phone but no email, open a WhatsApp welcome message
        const createdMember = !editing && res && 'member' in res ? (res as any).member : null
        if (createdMember && !createdMember.email && createdMember.phone) {
          const { full_name, phone, plan_id, membership_end } = createdMember;
          const selectedPlan = plans.find(p => p.id === plan_id);
          const planName = selectedPlan ? selectedPlan.name : 'Active Plan';
          const expiryDate = membership_end || 'N/A';
          
          const message = `Welcome to Fitness World, ${full_name}! We're thrilled to have you join. Your ${planName} membership starts now and is valid until ${expiryDate}. Let's crush those fitness goals together!`;
          
          let cleanPhone = phone.replace(/[^\d]/g, '');
          if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`;
          }
          
          const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger
          nativeButton={menuTrigger ? false : undefined}
          render={trigger}
        />
      )}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger
          nativeButton={menuTrigger ? false : undefined}
          render={<Button className="gap-2" />}
        >
          <Plus className="size-4" /> Add Member
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Member' : 'Add Member'}</DialogTitle>
          <DialogDescription>
            Enter the member&apos;s details and membership info.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={member?.full_name}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={member?.email ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                name="gender"
                defaultValue={member?.gender ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={member?.date_of_birth ?? ''}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={member?.address ?? ''}
            />
          </div>
          <div className="grid gap-2">
            <Label>Membership plan</Label>
            <Select value={planId} onValueChange={(val) => setPlanId(val ?? '')}>
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue placeholder="Select plan">
                  {plans.find((p) => p.id === planId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[350px]">
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="py-2.5 text-[13px]">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Member['status'])}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize py-2 text-[13px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="membership_start">Membership start</Label>
              <Input
                id="membership_start"
                name="membership_start"
                type="date"
                className="h-10 text-[13px]"
                defaultValue={member?.membership_start ?? ''}
              />
            </div>
          </div>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="membership_end">Membership end</Label>
                <Input
                  id="membership_end"
                  name="membership_end"
                  type="date"
                  className="h-10 text-[13px]"
                  defaultValue={member?.membership_end ?? ''}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editing ? 'Save changes' : 'Add member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
