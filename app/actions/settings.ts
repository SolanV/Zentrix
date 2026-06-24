'use server'

import { updateGymSettingsRecord } from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function updateGymSettings(formData: FormData) {
  try {
    const gymName = formData.get('gym_name') as string
    const location = (formData.get('location') as string) || null
    const phone = (formData.get('phone') as string) || null
    const email = (formData.get('email') as string) || null
    const emailRemindersEnabled = formData.get('email_reminders_enabled') === 'true'
    const reminderTemplate7Days = (formData.get('reminder_template_7_days') as string) || null
    const reminderTemplateToday = (formData.get('reminder_template_today') as string) || null

    if (!gymName) {
      return { error: 'Gym Name is required' }
    }

    await updateGymSettingsRecord({
      gym_name: gymName,
      location,
      phone,
      email,
      email_reminders_enabled: emailRemindersEnabled,
      reminder_template_7_days: reminderTemplate7Days,
      reminder_template_today: reminderTemplateToday,
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to update gym settings:', error)
    return { error: error instanceof Error ? error.message : 'Unable to update gym settings' }
  }
}
