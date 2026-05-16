import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <SignIn
        appearance={{
          elements: {
            card: 'shadow-none border-0 bg-transparent p-0 w-full',
            footer: 'hidden',

            headerTitle: 'text-foreground font-heading text-2xl font-semibold',
            headerSubtitle: 'text-muted-foreground text-sm',

            socialButtonsBlockButton:
              'border border-border bg-background text-foreground hover:bg-muted transition-colors rounded-lg h-11',
            socialButtonsBlockButtonText: 'text-sm font-medium',

            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground text-xs',

            formFieldLabel: 'text-sm text-foreground font-medium',
            formFieldInput:
              'border border-border bg-background text-foreground rounded-lg h-11 px-3 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
            formFieldInputShowPasswordButton: 'text-muted-foreground',

            formFieldErrorText: 'text-destructive text-xs',
            alertText: 'text-destructive text-sm',

            formButtonPrimary:
              'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg h-11 text-sm font-medium shadow-none',

            footerActionLink: 'text-primary hover:text-primary/80 font-medium',
            identityPreviewEditButton: 'text-primary',
          },
          layout: {
            socialButtonsPlacement: 'top',
          },
        }}
      />
    </Suspense>
  )
}