/**
 * Skeleton Loading Components
 *
 * Shimmer/skeleton states for dashboard client components.
 * refs #64
 */

'use client'

import { motion } from 'framer-motion'

function ShimmerPulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white/5 rounded-lg ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3"
        >
          <ShimmerPulse className="h-4 w-20" />
          <ShimmerPulse className="h-8 w-16" />
          <ShimmerPulse className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function HeatmapSkeleton() {
  return (
    <div className="space-y-4">
      <ShimmerPulse className="h-5 w-32" />
      <ShimmerPulse className="h-4 w-56" />
      <div className="flex justify-center py-8">
        <ShimmerPulse className="h-64 w-48 rounded-xl" />
      </div>
    </div>
  )
}

const BAR_HEIGHTS = ['h-[40%]', 'h-[65%]', 'h-[50%]', 'h-[80%]', 'h-[45%]', 'h-[70%]', 'h-[55%]']

export function VolumeChartSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <ShimmerPulse className="h-5 w-32" />
      <div className="flex items-end gap-2 h-40 pt-4">
        {BAR_HEIGHTS.map((h, i) => (
          <ShimmerPulse
            key={i}
            className={`flex-1 ${h}`}
          />
        ))}
      </div>
    </div>
  )
}

export function ImprovementsSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <ShimmerPulse className="h-5 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <ShimmerPulse className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <ShimmerPulse className="h-4 w-32" />
            <ShimmerPulse className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2">
          <ShimmerPulse className="h-8 w-64" />
          <ShimmerPulse className="h-4 w-40" />
        </div>
        <ShimmerPulse className="h-10 w-24 rounded-lg" />
      </div>

      {/* Stats */}
      <StatsCardsSkeleton />

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <HeatmapSkeleton />
        </div>
        <div className="space-y-4">
          <VolumeChartSkeleton />
          <ImprovementsSkeleton />
        </div>
      </div>
    </div>
  )
}

