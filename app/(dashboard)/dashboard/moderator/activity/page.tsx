import { ActivityLog } from '@/components/Activity/ActivityLog'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

export const dynamic = 'force-dynamic'

export default async function ModeratorActivityPage() {
  return (
    <DashboardPageWrapper>
      <ActivityLog title="My Activity" showActor={false} />
    </DashboardPageWrapper>
  )
}