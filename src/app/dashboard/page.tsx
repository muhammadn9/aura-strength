import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuraBackground from '@/components/aura/AuraBackground'
import GlassCard from '@/components/aura/GlassCard'
import MuscleHeatmap from '@/components/aura/MuscleHeatmap'
import CycleWarning from '@/components/dashboard/CycleWarning'
import AnalyticsStatsCards from '@/components/dashboard/AnalyticsStatsCards'
import ImprovementsCard from '@/components/dashboard/ImprovementsCard'
import VolumeChart from '@/components/dashboard/VolumeChart'
import { Dumbbell, TrendingUp, Calendar, LogOut, History, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // TODO: Fetch user profile and workout stats from Supabase
  const userName = user.email?.split('@')[0] || 'Athlete'

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words">
                Welcome back, <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent break-words">{userName}</span>
              </h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">Ready to build your aura?</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            </form>
          </div>

          {/* 30-Workout Cycle Warning */}
          <CycleWarning />

          {/* Analytics Stats */}
          <AnalyticsStatsCards />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Muscle Heatmap */}
            <GlassCard>
              <h2 className="text-xl font-bold text-white mb-4">Recovery Map</h2>
              <p className="text-sm text-slate-400 mb-6">
                Visual representation of muscle volume over the last 7 days
              </p>
              <MuscleHeatmap />
            </GlassCard>

            {/* Quick Actions */}
            <div className="space-y-4">
              <GlassCard>
                <h2 className="text-xl font-bold text-white mb-4">Quick Start</h2>
                <div className="space-y-3">
                  <Link
                    href="/workout/new"
                    className="block w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all text-center shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                  >
                    🤖 Generate AI Workout
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-lg hover:bg-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <History className="w-4 h-4" />
                    View History & Export
                  </Link>
                  <Link
                    href="/profile/setup"
                    className="block w-full px-4 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-lg hover:bg-white/10 hover:border-purple-500/50 transition-all text-center"
                  >
                    Update Profile
                  </Link>
                </div>
              </GlassCard>

              {/* Volume Chart */}
              <VolumeChart />

              {/* Improvements */}
              <ImprovementsCard />

              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-3">AI Coach Tip</h3>
                <p className="text-sm text-slate-300">
                  &quot;Welcome to AuraStrength! Complete your profile so I can design a personalized training program for you. I&apos;ll learn from every session to maximize your gains.&quot;
                </p>
                <p className="text-xs text-purple-400 mt-2">- Your AI Strength Coach</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

