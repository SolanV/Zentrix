import { SettingsForm } from '@/components/dashboard/settings-form'
import { DashboardTopbar } from '@/components/dashboard/gym-ui'
import { listSettingsPlans, getGymSettings } from '@/lib/cloudflare/d1'

export default async function SettingsPage() {
  const plans = await listSettingsPlans()
  const settings = await getGymSettings()

  return (
    <div>
      <DashboardTopbar title="Settings" />
      <SettingsForm plans={plans} initialSettings={settings} />
    </div>
  )
}

