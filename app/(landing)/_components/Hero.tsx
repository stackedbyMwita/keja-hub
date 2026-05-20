import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="pt-16 pb-8 border-b border-border">
      <MaxWidthWrapper className="py-0 flex  items-center justify-between">
        <div className="flex flex-col gap-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-widest">
            <span className="inline-block w-4 h-px bg-primary" />
            Verified listings only
          </span>

          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] tracking-tight">
            Find your next<br />
            <span className="text-muted-foreground">home in <span className='text-primary'>Kakamega</span>.</span>
          </h1>

          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            Every listing on KejaHub is physically verified by our team. 
            No fraud, no ghost houses — just real homes at honest prices.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-2">
            <div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">1,200+</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verified units</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">47</p>
              <p className="text-xs text-muted-foreground mt-0.5">Counties</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">100%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fraud-free</p>
            </div>
          </div>
        </div>
        <div>
          <Image
            src='/hero1.jpeg'
            alt="Beautiful Kenyan property"
            width={200}
            height={200}
          />
        </div>
      </MaxWidthWrapper>
    </section>
  )
}