import { MemberDialog } from '@/components/dashboard/member-dialog'
import { MembersTable } from '@/components/dashboard/members-table'
import { DashboardTopbar } from '@/components/dashboard/gym-ui'
import { listMembersWithPlans, listPlanOptions } from '@/lib/cloudflare/d1'

export default async function MembersPage() {
  const [memberList, planList] = await Promise.all([
    listMembersWithPlans(),
    listPlanOptions(),
  ])

  return (
    <div>
      <DashboardTopbar title="Members">
        <MemberDialog plans={planList} />
      </DashboardTopbar>
      <MembersTable members={memberList} plans={planList} />
    </div>
  )
}
