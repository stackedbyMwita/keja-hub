import { Toaster } from '@/components/toast/toaster';
import { APP_CONSTANTS } from '@/constants';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import React from 'react';
import { TooltipProvider } from '../ui/tooltip';
import { LogoProvider } from './logo-provider';
import { QueryProvider } from '@/app/providers/query-provider';

export default function Providers({ children }: { children: React.ReactNode}) {
  const Icon = APP_CONSTANTS.logoMark

  return (
    <ClerkProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LogoProvider
            value={{
              name: APP_CONSTANTS.name,
              icon: <Icon className="w-4 h-4" />,
            }}
          >
            <TooltipProvider>
                {children}
            </TooltipProvider>
          </LogoProvider>
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  )
}
