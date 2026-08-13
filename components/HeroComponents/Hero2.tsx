import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import Image from 'next/image'
import HeroStats from './HeroStats'

export function Hero() {
  return (
    <section className="relative pt-16 pb-8 border-b border-border overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <MaxWidthWrapper className="py-0 flex items-center justify-between gap-12 relative z-10">

        {/* ── Left — text content ─────────────────────────────────────── */}
        <div className="flex flex-col gap-5 max-w-2xl">

          {/* Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out [animation-fill-mode:both]">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 rounded-full border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Verified listings only
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 ease-out [animation-fill-mode:both]">
            Find your next<br />
            <span className="text-muted-foreground">home in </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Kakamega
            </span>.
          </h1>

          {/* Subtext */}
          <p className="text-base text-muted-foreground max-w-md leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 ease-out [animation-fill-mode:both]">
            Every listing on KejaLink is physically verified by our team.
            No fraud, no ghost houses — just real homes at honest prices.
          </p>

          {/* Stats */}
          <HeroStats />

        </div>

        {/* ── Right — floating image ──────────────────────────────────── */}
        <div className="relative hidden md:block flex-shrink-0 animate-in fade-in zoom-in-95 duration-1000 delay-300 ease-out [animation-fill-mode:both]">
          {/* Glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl" />

          <div className="relative animate-[floating_6s_ease-in-out_infinite]">
            <Image
              src="/hero3.jpeg"
              alt="Beautiful Kenyan property"
              width={420}
              height={520}
              priority
              className="rounded-2xl shadow-2xl ring-1 ring-border/50 object-cover"
            />

            {/* Floating badge on image */}
            <div className="absolute -bottom-4 -left-4 bg-background border border-border rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">Verified property</p>
                <p className="text-xs text-muted-foreground">Kakamega, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}