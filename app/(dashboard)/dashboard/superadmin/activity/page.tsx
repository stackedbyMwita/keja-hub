'use client'

import { ActivityLog } from '@/components/Activity/ActivityLog'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'

export default function AdminActivityPage() {
  return (
    <DashboardPageWrapper>
      <ActivityLog title="Platform Activity Logs" />
    </DashboardPageWrapper>
  )
}
