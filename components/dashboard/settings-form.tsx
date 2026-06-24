'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { GymCard, StatRow } from '@/components/dashboard/gym-ui'
import { formatCurrency } from '@/lib/format'
import { updateGymSettings } from '@/app/actions/settings'
import type { GymSettings } from '@/lib/types'

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
}

interface SettingsFormProps {
  plans: Plan[]
  initialSettings: GymSettings
}

export function SettingsForm({ plans, initialSettings }: SettingsFormProps) {
  const [gymName, setGymName] = useState(initialSettings.gym_name)
  const [location, setLocation] = useState(initialSettings.location || '')
  const [phone, setPhone] = useState(initialSettings.phone || '')
  const [email, setEmail] = useState(initialSettings.email || '')
  
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(
    initialSettings.email_reminders_enabled
  )
  const [reminderTemplate7Days, setReminderTemplate7Days] = useState(
    initialSettings.reminder_template_7_days || ''
  )
  const [reminderTemplateToday, setReminderTemplateToday] = useState(
    initialSettings.reminder_template_today || ''
  )

  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData()
    formData.append('gym_name', gymName)
    formData.append('location', location)
    formData.append('phone', phone)
    formData.append('email', email)
    formData.append('email_reminders_enabled', String(emailRemindersEnabled))
    formData.append('reminder_template_7_days', reminderTemplate7Days)
    formData.append('reminder_template_today', reminderTemplateToday)

    const res = await updateGymSettings(formData)
    setIsSaving(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Gym settings updated successfully!')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GymCard title="Gym details" className="mb-0">
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <Label htmlFor="gymName" className="mb-1 block text-xs text-muted-foreground">
                Gym name
              </Label>
              <Input
                id="gymName"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="location" className="mb-1 block text-xs text-muted-foreground">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="phone" className="mb-1 block text-xs text-muted-foreground">
                Contact phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email" className="mb-1 block text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>
            <Button type="submit" disabled={isSaving} className="h-8">
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </GymCard>

        <GymCard title="Membership plans" className="mb-0">
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active plans configured.</p>
          ) : (
            plans.map((p) => (
              <StatRow key={p.id} label={p.name} value={formatCurrency(p.price)} />
            ))
          )}
          <Button
            variant="outline"
            className="mt-3 h-8"
            render={<Link href="/dashboard/plans" />}
            nativeButton={false}
          >
            Edit plans
          </Button>
        </GymCard>
      </div>

      <GymCard title="Notification settings" className="mb-0">
        <form onSubmit={handleSave}>
          <div className="mb-4 flex items-center gap-3">
            <input
              id="emailRemindersEnabled"
              type="checkbox"
              checked={emailRemindersEnabled}
              onChange={(e) => setEmailRemindersEnabled(e.target.checked)}
              className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 bg-background accent-orange-500 cursor-pointer"
            />
            <Label htmlFor="emailRemindersEnabled" className="text-xs font-semibold cursor-pointer select-none">
              Enable automated email notifications (Welcome & Expiry reminders)
            </Label>
          </div>

          <div className="mb-3">
            <Label htmlFor="template7Days" className="mb-1 block text-xs text-muted-foreground">
              7 Days before expiry email template
            </Label>
            <textarea
              id="template7Days"
              value={reminderTemplate7Days}
              onChange={(e) => setReminderTemplate7Days(e.target.value)}
              className="w-full min-h-[90px] p-3 text-[13px] bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              placeholder="Enter email template for 7 days reminder..."
              disabled={!emailRemindersEnabled}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="templateToday" className="mb-1 block text-xs text-muted-foreground">
              Expiry day email template
            </Label>
            <textarea
              id="templateToday"
              value={reminderTemplateToday}
              onChange={(e) => setReminderTemplateToday(e.target.value)}
              className="w-full min-h-[90px] p-3 text-[13px] bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              placeholder="Enter email template for expiry day reminder..."
              disabled={!emailRemindersEnabled}
            />
          </div>

          <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-border/60">
            <p className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Template Placeholders
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div><code>{`{name}`}</code> - Member's full name</div>
              <div><code>{`{plan}`}</code> - Selected membership plan</div>
              <div><code>{`{expiry_date}`}</code> - Membership end date</div>
              <div><code>{`{gym_name}`}</code> - Gym name configured above</div>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="h-8">
            {isSaving ? 'Saving...' : 'Save notification settings'}
          </Button>
        </form>
      </GymCard>
    </div>
  )
}
