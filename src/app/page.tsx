import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AuraBackground from '@/components/aura/AuraBackground'
import GlassCard from '@/components/aura/GlassCard'
import { Dumbbell, Brain, TrendingUp, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <main className="max-w-6xl w-full space-y-12 text-center">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              AuraStrength
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
              Your AI-powered strength coach that learns, adapts, and maximizes every rep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/50"
              >
                Start Your Journey
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
            <GlassCard hover className="text-left space-y-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Coach</h3>
              <p className="text-sm text-slate-400">
                Gemini-powered intelligence that remembers your history and adapts your training
              </p>
            </GlassCard>

            <GlassCard hover className="text-left space-y-3">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Progressive Overload</h3>
              <p className="text-sm text-slate-400">
                Automatic weight progression based on RIR and performance data
              </p>
            </GlassCard>

            <GlassCard hover className="text-left space-y-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Muscle Heatmap</h3>
              <p className="text-sm text-slate-400">
                Visual recovery tracking shows exactly which muscles need work
              </p>
            </GlassCard>

            <GlassCard hover className="text-left space-y-3">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Real-Time Tracking</h3>
              <p className="text-sm text-slate-400">
                Log sets instantly with rest timers and performance feedback
              </p>
            </GlassCard>
          </div>
        </main>
      </div>
    </>
  )
}
