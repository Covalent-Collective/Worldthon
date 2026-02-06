'use client'

import type { ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface AuroraBackgroundProps {
  children?: ReactNode
  showRadialGradient?: boolean
  className?: string
}

export function AuroraBackground({
  children,
  showRadialGradient = true,
  className = '',
}: AuroraBackgroundProps) {
  return (
    <div
      className={`relative flex flex-col h-full w-full bg-night overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={`
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--cyan)_10%,var(--indigo)_15%,var(--blue)_20%,var(--violet)_25%,var(--cyan-dim)_30%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px]
            after:content-[""] after:absolute after:inset-0
            after:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform
            ${showRadialGradient ? '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]' : ''}
          `}
          style={{
            '--black': '#0A0A0F',
            '--transparent': 'transparent',
            '--cyan': '#00F2FF',
            '--indigo': '#667EEA',
            '--blue': '#4FACFE',
            '--violet': '#764BA2',
            '--cyan-dim': '#00C4CC',
          } as CSSProperties}
        />

        <motion.div
          className="absolute inset-0 mix-blend-screen opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-aurora-violet rounded-full blur-3xl opacity-50"
            animate={{
              x: [-50, 50, -50],
              y: [-20, 20, -20],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-aurora-cyan rounded-full blur-3xl opacity-30"
            animate={{
              x: [50, -50, 50],
              y: [20, -20, 20],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">{children}</div>
    </div>
  )
}
