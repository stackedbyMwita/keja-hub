import { ReactNode } from "react"
import { LANDING_PAGE_MENU, MenuProps } from "./menus"
import { LucideIcon, Star } from 'lucide-react'

export type AppConstantsProps = {
  name: string
  description: string
  logoMark: LucideIcon
  landingPageMenu: MenuProps[]
}

export const APP_CONSTANTS: AppConstantsProps = {
  name: "Hello World",
  description: "The platform built for teams who move fast. Manage, collaborate, and ship, all in one place.",
  logoMark: Star,
  landingPageMenu: LANDING_PAGE_MENU,
}