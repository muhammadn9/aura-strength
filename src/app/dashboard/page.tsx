import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuraBackground from '@/components/aura/AuraBackground'
import GlassCard from '@/components/aura/GlassCard'
import MuscleHeatmap from '@/components/aura/MuscleHeatmap'
import { Dumbbell, TrendingUp, Calendar, LogOut } from 'lucide-react'
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
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="text-slate-400 mt-1">Ready to build your aura?</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Workouts</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Personal Records</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">This Week</p>
                  <p className="text-2xl font-bold text-white">0 sessions</p>
                </div>
              </div>
            </GlassCard>
          </div>

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
                    href="/profile/setup"
                    className="block w-full px-4 py-3 bg-linear-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all text-center"
                  >
                    Complete Profile Setup
                  </Link>
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-slate-400 font-semibold rounded-lg opacity-50 cursor-not-allowed"
                  >
                    Start Workout (Complete profile first)
                  </button>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                <div className="text-center py-8 text-slate-400">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No workouts logged yet</p>
                  <p className="text-xs mt-1">Complete your profile to get started!</p>
                </div>
              </GlassCard>

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

