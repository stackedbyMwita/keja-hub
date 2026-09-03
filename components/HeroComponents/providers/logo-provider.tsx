'use client'

import React, { createContext, useContext } from 'react'

type LogoConfig = { name: string, icon?: React.ReactNode }
const LogoContext = createContext<LogoConfig | null>(null)

export function LogoProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: LogoConfig
}) {
  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>
}

export function useLogo() {
  const ctx = useContext(LogoContext)
  if (!ctx) {
    throw new Error('useLogo must be used within LogoProvider')
  }
  return ctx
}