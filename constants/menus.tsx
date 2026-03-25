import {
  House,
  Zap,
  CreditCard,
  HelpCircle,
  Users,
  Compass,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Mail,
} from "lucide-react";
import { JSX } from "react";

export type LandingPageMenuProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
  section?: boolean
  integration?: boolean
}

export type FooterLinkProps = {
  label: string
  path: string
  external?: boolean
}

export type FooterColumnProps = {
  id: number
  heading: string
  links: FooterLinkProps[]
}

export type FooterSocialProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
}

const size = 16

export const LANDING_PAGE_MENU: LandingPageMenuProps[] = [
  {
    id: 0,
    label: "Home",
    icon: <House size={size} />,
    path: "/",
    section: true,
  },
  {
    id: 1,
    label: "Features",
    icon: <Zap size={size} />,
    path: "/#features",
    section: true,
  },
  {
    id: 2,
    label: "Pricing",
    icon: <CreditCard size={size} />,
    path: "/#pricing",
    section: true,
  },
  {
    id: 3,
    label: "Customers",
    icon: <Users size={size} />,
    path: "/#customers",
    section: true,
  },
  {
    id: 4,
    label: "Explore",
    icon: <Compass size={size} />,
    path: "/explore",
    section: false,
  },
  {
    id: 5,
    label: "FAQ",
    icon: <HelpCircle size={size} />,
    path: "/#faq",
    section: true,
  },
]

export const FOOTER_COLUMNS: FooterColumnProps[] = [
  {
    id: 0,
    heading: "Product",
    links: [
      { label: "Features", path: "/#features" },
      { label: "Pricing", path: "/#pricing" },
      { label: "Changelog", path: "/changelog" },
      { label: "Roadmap", path: "/roadmap" },
      { label: "Status", path: "/status", external: true },
    ],
  },
  {
    id: 1,
    heading: "Resources",
    links: [
      { label: "Documentation", path: "/docs" },
      { label: "API Reference", path: "/docs/api" },
      { label: "Guides", path: "/docs/guides" },
      { label: "Blog", path: "/blog" },
      { label: "Explore", path: "/explore" },
    ],
  },
  {
    id: 2,
    heading: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Customers", path: "/#customers" },
      { label: "Careers", path: "/careers" },
      { label: "Press", path: "/press" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    id: 3,
    heading: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Cookie Policy", path: "/cookies" },
      { label: "Security", path: "/security" },
      { label: "GDPR", path: "/gdpr" },
    ],
  },
]

export const FOOTER_SOCIALS: FooterSocialProps[] = [
  {
    id: 0,
    label: "Twitter",
    icon: <Twitter size={size} />,
    path: "https://twitter.com",
  },
  {
    id: 1,
    label: "GitHub",
    icon: <Github size={size} />,
    path: "https://github.com",
  },
  {
    id: 2,
    label: "LinkedIn",
    icon: <Linkedin size={size} />,
    path: "https://linkedin.com",
  },
  {
    id: 3,
    label: "YouTube",
    icon: <Youtube size={size} />,
    path: "https://youtube.com",
  },
  {
    id: 4,
    label: "Email",
    icon: <Mail size={size} />,
    path: "mailto:support@helloworld.com",
  },
]