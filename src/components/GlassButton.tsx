'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

const glassButtonVariants = cva(
  'relative isolate cursor-pointer rounded-full transition-all',
  {
    variants: {
      size: {
        default: 'text-base font-medium',
        sm: 'text-sm font-medium',
        lg: 'text-lg font-medium',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const glassButtonTextVariants = cva(
  'glass-btn-text relative block select-none tracking-tight',
  {
    variants: {
      size: {
        default: 'px-6 py-3',
        sm: 'px-4 py-2',
        lg: 'px-8 py-4',
        icon: 'flex h-10 w-10 items-center justify-center',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, ...props }, ref) => {
    return (
      <div className={cn('glass-btn-wrap cursor-pointer rounded-full', className)}>
        <button
          className={cn('glass-btn', glassButtonVariants({ size }))}
          ref={ref}
          {...props}
        >
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>
            {children}
          </span>
        </button>
        <div className="glass-btn-shadow rounded-full" />
      </div>
    )
  }
)
GlassButton.displayName = 'GlassButton'

export { GlassButton, glassButtonVariants }
