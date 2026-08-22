import { Home, LucideIcon, Star } from 'lucide-react'
import { FOOTER_COLUMNS, FOOTER_SOCIALS, FooterColumnProps, FooterSocialProps, LANDING_PAGE_MENU, LandingPageMenuProps } from "./menus"

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
  name: "Keja Link",
  description: "The platform built for teams who move fast. Manage, collaborate, and ship, all in one place.",
  logoMark: Home,
  landingPageMenu: LANDING_PAGE_MENU,
  logo: "/logo.svg",
  supportEmail: "support@helloworld.com",
  footerColumns: FOOTER_COLUMNS,
  footerSocials: FOOTER_SOCIALS,
}
