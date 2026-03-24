import { ThemeProvider } from 'next-themes'
import React from 'react'
import { TooltipProvider } from '../ui/tooltip'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
          {children}
      </TooltipProvider>

      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
