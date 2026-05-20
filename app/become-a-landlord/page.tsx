import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import { LandlordForm } from './_components/LandlordForm'
import { UnderReview } from './_components/UnderReview'
import { Rejected } from './_components/Rejected'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Become a Landlord — KejaHub',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function BecomeALandlordPage() {
  // Tell Next.js this page is intentionally dynamic
  await connection()

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in?redirectUrl=/become-a-landlord')
  }

  const meta = (sessionClaims?.publicMetadata ?? {}) as { role?: string }
  const role = meta.role ?? 'user'

  if (role === 'landlord') {
    redirect('/dashboard/landlord')
  }

  const { data: application } = await supabase
    .from('landlord_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (application?.status === 'approved') {
    redirect('/dashboard/landlord')
  }

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthWrapper className="py-10 max-w-2xl">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          Back to listings
        </Link>

        {application?.status === 'pending' && (
          <UnderReview applicationDate={application.created_at} />
        )}

        {application?.status === 'rejected' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-4xl text-foreground">
                Reapply as a landlord
              </h1>
              <p className="text-sm text-muted-foreground">
                Update your details and resubmit your application.
              </p>
            </div>
            <Rejected
              rejectionReason={application.rejection_reason}
              existingData={{
                full_name:            application.full_name,
                phone_number:         application.phone_number,
                whatsapp_number:      application.whatsapp_number,
                county:               application.county,
                location:             application.location,
                number_of_properties: application.number_of_properties,
                number_of_units:      application.number_of_units,
                property_names:       application.property_names ?? [],
                notes:                application.notes,
              }}
            />
          </div>
        )}

        {!application && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" />
                Verified landlords only
              </div>
              <h1 className="font-heading text-4xl md:text-5xl text-foreground leading-tight">
                List your property<br />
                <span className="text-muted-foreground">on KejaHub.</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Fill in your details below. Our team will review your application,
                contact you to verify your properties, and activate your landlord
                account within 1–3 business days.
              </p>
            </div>

            <div className="flex items-center gap-6 py-4 border-y border-border">
              {['Free to apply', 'Response in 1–3 days', 'Physical verification'].map((label, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            <LandlordForm mode="apply" />
          </div>
        )}

      </MaxWidthWrapper>
    </div>
  )
}