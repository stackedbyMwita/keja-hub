import { ReactNode } from "react"
import { FooterColumnProps, FooterSocialProps, LandingPageMenuProps } from "./menus"
import { FOOTER_COLUMNS, FOOTER_SOCIALS, LANDING_PAGE_MENU } from "./menus"
import { LucideIcon, Star } from 'lucide-react'

export type AppConstantsProps = {
  name: string
  description: string
  logoMark: LucideIcon
  landingPageMenu: LandingPageMenuProps[]
  logo: string
  supportEmail: string
  footerColumns: FooterColumnProps[]
  footerSocials: FooterSocialProps[]
}

export const APP_CONSTANTS: AppConstantsProps = {
  name: "Hello World",
  description: "The platform built for teams who move fast. Manage, collaborate, and ship, all in one place.",
  logoMark: Star,
  landingPageMenu: LANDING_PAGE_MENU,
  logo: "/logo.svg",
  supportEmail: "support@helloworld.com",
  footerColumns: FOOTER_COLUMNS,
  footerSocials: FOOTER_SOCIALS,
}