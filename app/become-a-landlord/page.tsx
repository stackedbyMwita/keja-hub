import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import { ShieldCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { UnderReview } from '@/components/BecomeALandlordComponents/UnderReview'
import { Rejected } from '@/components/BecomeALandlordComponents/Rejected'
import { LandlordForm } from '@/components/BecomeALandlordComponents/LandlordForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Become a Landlord — KejaLink',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function BecomeALandlordPage() {
  await connection()

  const { userId, sessionClaims } = await auth()

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
    <div className="min-h-screen bg-background pb-24">
      <MaxWidthWrapper className="py-8 md:py-12 max-w-3xl">

        {/* ── Back link ───────────────────────────────────────────────── */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all mb-10 group w-fit"
        >
          <div className="p-1.5 rounded-full bg-muted/50 group-hover:bg-border border border-transparent group-hover:border-border/50 transition-colors">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          Back to listings
        </Link>

        {/* ── Pending State ───────────────────────────────────────────── */}
        {application?.status === 'pending' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <UnderReview applicationDate={application.created_at} />
          </div>
        )}

        {/* ── Rejected State ──────────────────────────────────────────── */}
        {application?.status === 'rejected' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col gap-2 p-6 md:p-8 rounded-3xl bg-destructive/5 border border-destructive/10">
              <h1 className="font-heading text-3xl md:text-4xl text-foreground tracking-tight">
                Reapply as a landlord
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                Please update your details based on the feedback below and resubmit your application.
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

        {/* ── New Application State ─────────────────────────────────────── */}
        {!application && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            
            {/* Header Content */}
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-widest w-fit mb-2 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Verified landlords only
              </div>
              
              <h1 className="font-heading text-5xl md:text-6xl text-foreground leading-[1.05] tracking-tight">
                List your property<br />
                <span className="text-muted-foreground">on KejaLink.</span>
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mt-2">
                Fill in your details below. Our team will review your application, 
                contact you to verify your properties, and activate your landlord 
                account within 1–3 business days.
              </p>
            </div>

            {/* Premium Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 py-6 border-y border-border/50">
              {['Free to apply', 'Response in 1–3 days', 'Physical verification'].map((label, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted/40 border border-border/60 text-sm font-medium text-foreground shadow-sm"
                >
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {/* The Form */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
              <LandlordForm mode="apply" />
            </div>
            
          </div>
        )}

      </MaxWidthWrapper>
    </div>
  )
}