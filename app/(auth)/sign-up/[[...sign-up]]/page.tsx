import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
  title: 'Create an account — KejaHub',
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUp
        appearance={{
          elements: {
            card:                      'shadow-none border-0 bg-transparent p-0 w-full',
            footer:                    'hidden',
            headerTitle:               'font-heading text-3xl text-foreground',
            headerSubtitle:            'text-sm text-muted-foreground',
            socialButtonsBlockButton:  'border border-border bg-background text-foreground hover:bg-muted transition-colors rounded-lg h-11',
            socialButtonsBlockButtonText: 'text-sm font-medium',
            dividerLine:               'bg-border',
            dividerText:               'text-muted-foreground text-xs',
            formFieldLabel:            'text-xs font-medium text-foreground',
            formFieldInput:            'border border-border bg-background text-foreground rounded-lg h-11 px-3 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
            formFieldInputShowPasswordButton: 'text-muted-foreground',
            formFieldErrorText:        'text-destructive text-xs',
            alertText:                 'text-destructive text-sm',
            formButtonPrimary:         'bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg h-11 text-sm font-semibold shadow-none',
            footerActionLink:          'text-primary hover:text-primary/80 font-medium',
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