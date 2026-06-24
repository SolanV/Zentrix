'use server'

import {
  createMemberRecord,
  deleteMemberRecord,
  getPlanDuration,
  updateMemberRecord,
  getGymSettings,
  getPlanRecord,
} from '@/lib/cloudflare/d1'
import type { MemberStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { sendEmail, getWelcomeEmailHtml } from '@/lib/email'

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function createMember(formData: FormData) {
  const planId = (formData.get('plan_id') as string) || null
  const start =
    (formData.get('membership_start') as string) ||
    new Date().toISOString().slice(0, 10)

  let end: string | null = null
  if (planId) {
    const durationDays = await getPlanDuration(planId)
    if (durationDays) end = addDays(start, durationDays)
  }

  const fullName = formData.get('full_name') as string
  const email = (formData.get('email') as string) || null

  try {
    await createMemberRecord({
      full_name: fullName,
      email: email,
      phone: (formData.get('phone') as string) || null,
      gender: (formData.get('gender') as string) || null,
      date_of_birth: (formData.get('date_of_birth') as string) || null,
      address: (formData.get('address') as string) || null,
      plan_id: planId,
      membership_start: start,
      membership_end: end,
      status: ((formData.get('status') as string) || 'active') as MemberStatus,
    })

    // Send Welcome Email if email is present and settings allow it
    if (email) {
      try {
        const settings = await getGymSettings()
        if (settings && settings.email_reminders_enabled) {
          let planName = 'No active plan'
          if (planId) {
            const plan = await getPlanRecord(planId)
            if (plan) {
              planName = plan.name
            }
          }
          const htmlContent = getWelcomeEmailHtml({
            name: fullName,
            plan: planName,
            start_date: start,
            expiry_date: end || 'N/A',
            gym_name: settings.gym_name,
          })
          await sendEmail({
            to: email,
            subject: `Welcome to ${settings.gym_name}!`,
            html: htmlContent,
          })
        }
      } catch (emailErr) {
        console.error('Error sending welcome email:', emailErr)
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create member' }
  }


  revalidatePath('/dashboard/members')
  revalidatePath('/dashboard')
  return { 
    success: true,
    member: {
      full_name: fullName,
      email: email,
      phone: (formData.get('phone') as string) || null,
      plan_id: planId,
      membership_start: start,
      membership_end: end
    }
  }
}

export async function updateMember(id: string, formData: FormData) {
  try {
    await updateMemberRecord(id, {
      full_name: formData.get('full_name') as string,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      gender: (formData.get('gender') as string) || null,
      date_of_birth: (formData.get('date_of_birth') as string) || null,
      address: (formData.get('address') as string) || null,
      plan_id: (formData.get('plan_id') as string) || null,
      membership_start: (formData.get('membership_start') as string) || null,
      membership_end: (formData.get('membership_end') as string) || null,
      status: ((formData.get('status') as string) || 'active') as MemberStatus,
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update member' }
  }

  revalidatePath('/dashboard/members')
  return { success: true }
}

export async function deleteMember(id: string) {
  try {
    await deleteMemberRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete member' }
  }

  revalidatePath('/dashboard/members')
  revalidatePath('/dashboard')
  return { success: true }
}
