/**
 * Dashboard Loading State
 *
 * Rendered by Next.js while the dashboard page is loading.
 * Uses skeleton components for a polished shimmer effect.
 * refs #64
 */

import AuraBackground from '@/components/aura/AuraBackground'
import { DashboardSkeleton } from '@/components/dashboard/Skeletons'

export default function DashboardLoading() {
  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    </>
  )
}

