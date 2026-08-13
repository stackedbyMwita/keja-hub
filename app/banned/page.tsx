import { SignOutButton } from '@clerk/nextjs'
import { ShieldX } from 'lucide-react'

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl text-foreground">
            Account suspended
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your account has been suspended due to a violation of KejaLink&apos;s
            terms of service. If you believe this is a mistake, please contact
            our support team.
          </p>
        </div>

        {/* Contact */}
        <a
          href="mailto:support@kejalink.co.ke"
          className="text-sm text-primary font-medium hover:underline underline-offset-4"
        >
          support@kejalink.co.ke
        </a>

        {/* Sign out */}
        <SignOutButton redirectUrl="/">
          <button className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Sign out
          </button>
        </SignOutButton>

      </div>
    </div>
  )
}