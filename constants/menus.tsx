import {
  House,
  Zap,
  CreditCard,
  HelpCircle,
  Users,
  Compass,
} from "lucide-react";
import { JSX } from "react";

export type MenuProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
  section?: boolean
  integration?: boolean
}

const size = 16

export const LANDING_PAGE_MENU: MenuProps[] = [
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