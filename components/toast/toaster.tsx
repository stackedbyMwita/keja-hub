'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as 'light' | 'dark' | 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: `
            group toast
            group-[.toaster]:bg-background
            group-[.toaster]:text-foreground
            group-[.toaster]:border-border
            group-[.toaster]:shadow-lg
            font-sans
          `,
          title: 'font-sans text-sm font-semibold',
          description: 'font-sans text-xs text-muted-foreground',
          error: 'border-destructive/50 text-destructive',
          success: 'border-green-500/50 text-green-600 dark:text-green-400',
          warning: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
          info: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
        },
      }}
      position="top-right"
      expand={false}
      richColors
      duration={4000}
    />
  );
}
