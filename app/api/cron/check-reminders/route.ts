import { NextResponse } from 'next/server'
import { getGymSettings, listMembersExpiringIn } from '@/lib/cloudflare/d1'
import { sendEmail, renderTemplate, getReminderEmailHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const settings = await getGymSettings()

    if (!settings || !settings.email_reminders_enabled) {
      return NextResponse.json({
        success: true,
        status: 'disabled',
        message: 'Email reminders are disabled in settings.',
      })
    }

    const gymName = settings.gym_name
    const template7Days =
      settings.reminder_template_7_days ||
      'Hello {name}, your {plan} membership at {gym_name} will expire in 7 days on {expiry_date}. Please renew it to continue using our services.'
    const templateToday =
      settings.reminder_template_today ||
      'Hello {name}, your {plan} membership at {gym_name} expires today on {expiry_date}. Please renew it to continue using our services.'

    // 1. Fetch expiring members
    const expiring7Days = await listMembersExpiringIn(7)
    const expiringToday = await listMembersExpiringIn(0)

    const results: {
      expiring_7_days_sent: Array<{ name: string; email: string; status: string; error?: any }>
      expiring_today_sent: Array<{ name: string; email: string; status: string; error?: any }>
    } = {
      expiring_7_days_sent: [],
      expiring_today_sent: [],
    }

    // 2. Process 7 days reminders
    for (const member of expiring7Days) {
      if (!member.email) continue
      const planName = member.membership_plans?.name || 'Active Plan'
      const variables = {
        name: member.full_name,
        plan: planName,
        expiry_date: member.membership_end || 'N/A',
        gym_name: gymName,
      }

      const textMessage = renderTemplate(template7Days, variables)
      const htmlContent = getReminderEmailHtml(textMessage, { gym_name: gymName })

      const emailResult = await sendEmail({
        to: member.email,
        subject: `Membership Expiry Reminder - 7 Days Remaining`,
        html: htmlContent,
      })

      results.expiring_7_days_sent.push({
        name: member.full_name,
        email: member.email,
        status: emailResult.success ? 'sent' : 'failed',
        error: emailResult.error,
      })
    }

    // 3. Process today's reminders
    for (const member of expiringToday) {
      if (!member.email) continue
      const planName = member.membership_plans?.name || 'Active Plan'
      const variables = {
        name: member.full_name,
        plan: planName,
        expiry_date: member.membership_end || 'N/A',
        gym_name: gymName,
      }

      const textMessage = renderTemplate(templateToday, variables)
      const htmlContent = getReminderEmailHtml(textMessage, { gym_name: gymName })

      const emailResult = await sendEmail({
        to: member.email,
        subject: `Membership Expired Today`,
        html: htmlContent,
      })

      results.expiring_today_sent.push({
        name: member.full_name,
        email: member.email,
        status: emailResult.success ? 'sent' : 'failed',
        error: emailResult.error,
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        sent_7_days: results.expiring_7_days_sent.length,
        sent_today: results.expiring_today_sent.length,
      },
      details: results,
    })
  } catch (error) {
    console.error('Error running check-reminders cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    )
  }
}
