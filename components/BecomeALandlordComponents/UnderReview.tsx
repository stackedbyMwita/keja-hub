import { CheckCircle2, Clock, Mail } from 'lucide-react'
import Link from 'next/link'

interface UnderReviewProps {
  applicationDate: string
}

export function UnderReview({ applicationDate }: UnderReviewProps) {
  const date = new Date(applicationDate).toLocaleDateString('en-KE', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })

  return (
    <div className="flex flex-col items-center text-center gap-8 max-w-md mx-auto py-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Clock className="h-9 w-9 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-foreground">
          Application under review
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your landlord application submitted on{' '}
          <span className="font-medium text-foreground">{date}</span> is
          currently being reviewed by our team. We typically respond within
          1–3 business days.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 text-left">
        {[
          { label: 'Application submitted',       done: true  },
          { label: 'Moderator review in progress', done: false },
          { label: 'Physical verification',        done: false },
          { label: 'Account activated',            done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border
              ${step.done
                ? 'bg-primary border-primary'
                : 'bg-background border-border'
              }
            `}>
              {step.done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              }
            </div>
            <p className={`text-sm ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full p-4 rounded-xl bg-muted/50 border border-border flex flex-col gap-2">
        <p className="text-xs font-medium text-foreground">
          Our moderator may reach out to you directly
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please keep your phone and WhatsApp available. They may call or
          message to confirm your property details.
        </p>
        <div className="flex items-center gap-4 mt-1">
          <a
            href="mailto:support@kejalink.co.ke"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2"
          >
            <Mail className="h-3 w-3" />
            support@kejalink.co.ke
          </a>
        </div>
      </div>

      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
      >
        Back to listings
      </Link>

    </div>
  )
}
