import React from 'react';
import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';

const stats = [
  { value: 1200, suffix: '+', label: 'Verified units', duration: 2.5 },
  { value: 47, suffix: '', label: 'Counties', duration: 2 },
  { value: 100, suffix: '%', label: 'Fraud-free', duration: 2.5 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.5,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroStats() {
  return (
    <motion.div
      className="flex items-center gap-6 pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          {/* Vertical Divider */}
          {i > 0 && (
            <motion.div 
              variants={itemVariants}
              className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent flex-shrink-0" 
            />
          )}
          
          {/* Stat Block */}
          <motion.div 
            variants={itemVariants}
            className="group cursor-default transition-transform duration-300 hover:-translate-y-1"
          >
            <p className="text-lg font-black text-foreground tabular-nums tracking-tight group-hover:text-primary transition-colors">
              <CountUp 
                end={stat.value} 
                suffix={stat.suffix} 
                duration={stat.duration} 
                separator=","
                enableScrollSpy={true}
                scrollSpyOnce={true}
              />
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1 tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        </React.Fragment>
      ))}
    </motion.div>
  );
}