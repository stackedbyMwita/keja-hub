import { APP_CONSTANTS } from "@/constants"
import { FOOTER_COLUMNS, FOOTER_SOCIALS } from "@/constants/menus"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLogo } from "@/components/logo/Logo"
import { Grain } from "./grain-texture/grain"
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper"
import { Mail } from "lucide-react"
import { WordMark } from "./WordMark"

export function FooterExtensive() {
  return (
    <footer className="relative overflow-hidden bg-muted/30 border-t border-border">
    <Grain opacity={0.2} />
    <MaxWidthWrapper className="relative z-10 py-16 lg:py-16">

      {/* top: brand + newsletter */}
      <div className="flex justify-between items-start flex-wrap gap-10 pb-12 border-b border-border">
        <div className="max-w-xs">
          <AppLogo className="mb-4" />
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {APP_CONSTANTS.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary block" />
            <span className="text-xs text-primary">All systems operational</span>
          </div>
        </div>
        <div className="min-w-[280px]">
          <p className="text-sm text-muted-foreground mb-3">Get product updates in your inbox</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@company.com"
            />
            <Button className="whitespace-nowrap">
              <Mail size={12}/>
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-2">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* link columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-border">
        {FOOTER_COLUMNS.map(col => (
          <div key={col.id}>
            <p className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-4">{col.heading}</p>
            <div className="flex flex-col gap-2.5">
              {col.links.map(link => (
                <Link
                  key={link.label}
                  href={link.path}
                  target={link.external ? "_blank" : undefined}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="flex justify-between items-center pt-5 flex-wrap gap-4">
        <p className="text-xs text-muted-foreground/50">
          © 2025 {APP_CONSTANTS.name}, Inc. All rights reserved.
        </p>
        <div className="flex gap-5">
          {FOOTER_SOCIALS.map(s => (
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

    </MaxWidthWrapper>
    {/* giant fading wordmark */}
    <WordMark align="right" size="lg" /> 
  </footer>
  )
}