import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ReviewActions } from './_components/ReviewActions'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface PageProps {
  params: Promise<{ applicationId: string }>
}

export default async function ReviewPage({ params }: PageProps) {
  const { applicationId } = await params
  const { userId }        = await auth()

  const { data: app, error } = await supabase
    .from('landlord_profiles')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (error || !app) notFound()

  const isMyApplication = app.assigned_moderator_id === userId
  const isClaimed       = !!app.assigned_moderator_id && !isMyApplication

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* Back */}
      <Link
        href="/dashboard/moderator/landlord"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to queue
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{app.full_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted {new Date(app.created_at).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={app.status === 'pending' ? 'secondary' : 'outline'} className="capitalize shrink-0 rounded-full">
          {app.status}
        </Badge>
      </div>

      <Separator />

      {/* Landlord details */}
      <Section title="Contact details">
        <Row label="Full name"       value={app.full_name} />
        <Row label="Phone"           value={app.phone_number} />
        <Row label="WhatsApp"        value={app.whatsapp_number ?? 'Not provided'} />
      </Section>

      <Separator />

      {/* Property details */}
      <Section title="Property details">
        <Row label="County"          value={app.county} />
        <Row label="Location/Estate" value={app.location} />
        <Row label="Properties"      value={String(app.number_of_properties)} />
        <Row label="Total units"     value={String(app.number_of_units)} />
        {app.property_names?.length > 0 && (
          <Row
            label="Property names"
            value={app.property_names.join(', ')}
          />
        )}
      </Section>

      {app.notes && (
        <>
          <Separator />
          <Section title="Landlord notes">
            <p className="text-sm text-muted-foreground leading-relaxed">{app.notes}</p>
          </Section>
        </>
      )}

      <Separator />

      {/* Claimed status */}
      {isClaimed && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            This application has been claimed by another moderator
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            You can still review and action it if needed.
          </p>
        </div>
      )}

      {/* Action panel — client component */}
      {app.status === 'pending' && (
        <ReviewActions applicationId={applicationId} />
      )}

      {/* Already reviewed */}
      {app.status !== 'pending' && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-medium text-foreground capitalize">
            Application {app.status}
          </p>
          {app.rejection_reason && (
            <p className="text-xs text-muted-foreground mt-1">
              Reason: {app.rejection_reason}
            </p>
          )}
        </div>
      )}

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}