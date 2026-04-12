import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const badgeVariants: Record<string, string> = {
  default: 'bg-slate-700 text-slate-100',
  secondary: 'bg-slate-800 text-slate-300',
  success: 'bg-green-900/30 text-green-400 border border-green-700',
  warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
  danger: 'bg-red-900/30 text-red-400 border border-red-700',
  info: 'bg-blue-900/30 text-blue-400 border border-blue-700',
}

const badgeSizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  )
}
