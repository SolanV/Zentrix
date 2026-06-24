import { GymSettings } from './types'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined. Email could not be sent.')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Fitness World <${fromEmail}>`,
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send email via Resend API:', errorText)
      return { success: false, error: errorText }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function renderTemplate(
  template: string,
  variables: {
    name: string
    plan: string
    start_date?: string
    expiry_date: string
    gym_name: string
  }
) {
  return template
    .replace(/{name}/g, variables.name)
    .replace(/{plan}/g, variables.plan)
    .replace(/{start_date}/g, variables.start_date || '')
    .replace(/{expiry_date}/g, variables.expiry_date)
    .replace(/{gym_name}/g, variables.gym_name)
}

export function getWelcomeEmailHtml(variables: {
  name: string
  plan: string
  start_date: string
  expiry_date: string
  gym_name: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${variables.gym_name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            border: 1px solid #334155;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.025em;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .content {
            padding: 40px 32px;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-top: 0;
            margin-bottom: 24px;
          }
          .member-card {
            background-color: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .card-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-bottom: 16px;
            font-weight: 700;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #1e293b;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #94a3b8;
            font-size: 14px;
          }
          .info-value {
            color: #f8fafc;
            font-weight: 600;
            font-size: 14px;
            text-align: right;
          }
          .footer {
            background-color: #111827;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #1e293b;
          }
          .footer p {
            margin: 0;
            font-size: 13px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${variables.gym_name}!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${variables.name}</strong>,</p>
            <p>Your membership has been successfully registered. We are absolutely thrilled to welcome you to the community! Get ready to crush your fitness goals with us.</p>
            
            <div class="member-card">
              <div class="card-title">Membership Details</div>
              <div class="info-row">
                <span class="info-label">Membership Plan</span>
                <span class="info-value">${variables.plan}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date</span>
                <span class="info-value">${variables.start_date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expiry Date</span>
                <span class="info-value">${variables.expiry_date}</span>
              </div>
            </div>
            
            <p>If you have any questions or need guidance on workouts/diet, please don't hesitate to reach out to our staff or trainers at the desk.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${variables.gym_name}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getReminderEmailHtml(
  messageBody: string,
  variables: {
    gym_name: string
  }
) {
  // Convert newlines in templates to HTML line breaks
  const formattedBody = messageBody.replace(/\n/g, '<br>')
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Membership Update</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            border: 1px solid #334155;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.025em;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .content {
            padding: 40px 32px;
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
          }
          .content p {
            margin-top: 0;
            margin-bottom: 24px;
          }
          .footer {
            background-color: #111827;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #1e293b;
          }
          .footer p {
            margin: 0;
            font-size: 13px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Membership Reminder</h1>
          </div>
          <div class="content">
            <p>${formattedBody}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${variables.gym_name}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
