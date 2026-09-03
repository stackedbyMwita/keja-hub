import { AppLogo } from "@/components/logo/Logo"
import { APP_CONSTANTS } from "@/constants"
import { FOOTER_COLUMNS, FOOTER_SOCIALS } from "@/constants/menus"
import Link from "next/link"
import { Grain } from "./grain-texture/grain"
import { WordMark } from "./WordMark"

import ThemeToggle from '@/components/theme/ThemeToggle'
import MaxWidthWrapper from "@/components/UIComponents/layout/MaxWidthWrapper"

export function FooterMinimal() {
  const cols = ["Product", "Company", "Legal"]
    .map(heading => FOOTER_COLUMNS.find(c => c.heading === heading))
    .filter(Boolean)

  return (
    <footer className="relative overflow-hidden bg-muted/30 border-t border-border">
      <Grain opacity={0.2} />
      <MaxWidthWrapper className="relative z-10 py-14 lg:py-14">

        <div className="flex justify-between items-start flex-wrap gap-8 pb-8 border-b border-border">
          <div>
            <AppLogo className="mb-3" />
            <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
              {APP_CONSTANTS.description}
            </p>
          </div>
          <div className="flex gap-12 flex-wrap">
            {cols.map(col => col && (
              <div key={col.id}>
                <p className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-3">{col.heading}</p>
                <div className="flex flex-col gap-2">
                  {col.links.slice(0, 3).map(link => (
                    <Link
                      key={link.label}
                      href={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-5 flex-wrap gap-3">
          <p className="text-xs text-muted-foreground/50">
            © 2025 {APP_CONSTANTS.name}. All rights reserved.
          </p>
           
          <div className="flex gap-4">
            <ThemeToggle />
            {FOOTER_SOCIALS.slice(0, 3).map(s => (
              <Link
                key={s.id}
                href={s.path}
                target="_blank"
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <WordMark align="left"  size="md" /> 

      </MaxWidthWrapper>
    </footer>
  )
}