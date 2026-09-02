'use client'

import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import MaxWidthWrapper from '@/components/UIComponents/layout/MaxWidthWrapper'
import HeroStats from './HeroStats'

// variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  },
}

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 border-b border-border overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 opacity-50" />
      <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl -z-10" />

      <MaxWidthWrapper className="py-0 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* ── Left — Text Content ─────────────────────────────────────── */}
        <motion.div 
          className="flex flex-col gap-6 max-w-2xl w-full items-center text-center md:text-right md:items-end"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm shadow-sm transition-colors hover:bg-primary/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Verified listings only
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight"
          >
            Find your next<br />
            <span className="text-muted-foreground">home in </span>
            <span className="text-primary">
              Kakamega
            </span>.
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-md leading-relaxed"
          >
            Every listing on KejaLink is physically verified by our team. 
            No fraud, no ghost houses — just real homes at honest prices.
          </motion.p>

          {/* Stats Component */}
          <motion.div variants={itemVariants} className="pt-2">
            <HeroStats />
          </motion.div>

        </motion.div>

        {/* ── Right — Interactive Floating Image ──────────────────────────────────── */}
        <motion.div 
          className="relative hidden md:block flex-shrink-0 w-full max-w-[420px]"
          initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Decorative Backing Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-transparent to-transparent rounded-[2rem] blur-2xl -z-10" />

          {/* Image Container with Floating Physics */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative cursor-pointer group"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                src="/hero3.jpeg"
                alt="Beautiful Kenyan property"
                width={420}
                height={520}
                priority
                className="rounded-[2rem] shadow-2xl ring-1 ring-border/50 object-cover"
              />
            </motion.div>

            {/* Floating Status Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border/60 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md flex items-center gap-3 group-hover:border-primary/40 transition-colors duration-300"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-foreground">Verified property</p>
                <p className="text-xs font-medium text-muted-foreground">Kakamega, Kenya</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

      </MaxWidthWrapper>
    </section>
  )
}