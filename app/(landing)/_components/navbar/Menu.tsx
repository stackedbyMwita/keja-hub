"use client"

import { APP_CONSTANTS } from "@/constants"
import { useNavigation } from "@/hooks/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

type MenuProps = {
  orientation: "mobile" | "desktop"
}

export default function NavMenu({ orientation }: MenuProps) {
  const { section, onSetSection } = useNavigation()

  if (orientation === "desktop") {
    return (
      <div className="flex items-center gap-1 p-1 bg-accent text-accent-foreground rounded-md">
        {APP_CONSTANTS.landingPageMenu.map((menuItem) => {
          const isActive = section === menuItem.path
          return (
            <Link
              key={menuItem.id}
              href={menuItem.path}
              {...(menuItem.section && { onClick: () => onSetSection(menuItem.path) })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-colors",
                isActive
                  ? "font-medium bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {isActive && <span className="w-4 h-4">{menuItem.icon}</span>}
              {menuItem.label}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-2.5">
      {APP_CONSTANTS.landingPageMenu.map((menuItem) => {
        const isActive = section === menuItem.path
        return (
          <Link
            key={menuItem.id}
            href={menuItem.path}
            {...(menuItem.section && { onClick: () => onSetSection(menuItem.path) })}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <span className="w-4 h-4 shrink-0">{menuItem.icon}</span>
            {menuItem.label}
          </Link>
        )
      })}
    </div>
  )
}
