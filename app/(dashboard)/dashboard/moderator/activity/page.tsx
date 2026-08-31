import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, XCircle, FileText,
  ImageIcon, Star, ClipboardList,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper'
import { ActivityLog } from '@/components/Activity/ActivityLog'

export const dynamic = 'force-dynamic'

export default async function ModeratorActivityPage() {
  return (
    <DashboardPageWrapper>
      <ActivityLog title="My Activity" showActor={false} />
    </DashboardPageWrapper>
  )
}