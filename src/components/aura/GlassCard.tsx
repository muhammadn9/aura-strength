import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl',
        hover && 'transition-all hover:bg-white/10 hover:border-purple-500/50 hover:shadow-purple-500/20',
        className
      )}
    >
      {children}
    </div>
  )
}

