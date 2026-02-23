'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuraBackground from '@/components/aura/AuraBackground'
import GlassCard from '@/components/aura/GlassCard'
import { motion } from 'framer-motion'
import { Loader2, User, Ruler, Weight, Calendar, Target, Dumbbell } from 'lucide-react'
import { EquipmentSelector, type EquipmentByGroup } from '@/components/profile/EquipmentSelector'

const EMPTY_EQUIPMENT: EquipmentByGroup = { chest: [], back: [], shoulders: [], arms: [], legs: [], core: [] }

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<EquipmentByGroup>(EMPTY_EQUIPMENT)
  const [authChecked, setAuthChecked] = useState(false)

  // Auth guard: redirect unauthenticated users on page load
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  const [formData, setFormData] = useState({
    age: '',
    height_feet: '',
    height_inches: '',
    weight: '',
    training_age: '',
    split_preference: 'ppl',
    training_goals: [] as string[],
  })

  const splitOptions = [
    { value: 'ppl', label: 'Push/Pull/Legs (6x/week)' },
    { value: 'upper-lower', label: 'Upper/Lower (4x/week)' },
    { value: 'full-body', label: 'Full Body (3x/week)' },
    { value: 'bro-split', label: 'Bro Split (5x/week)' },
    { value: 'arnold', label: 'Arnold Split (6x/week)' },
  ]

  const goalOptions = [
    'Muscle Growth (Hypertrophy)',
    'Strength',
    'Fat Loss',
    'Athletic Performance',
    'General Fitness',
  ]

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      training_goals: prev.training_goals.includes(goal)
        ? prev.training_goals.filter(g => g !== goal)
        : [...prev.training_goals, goal]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      // Store height in inches and weight in lbs (imperial only)
      const heightInches = (parseInt(formData.height_feet) || 0) * 12 + (parseInt(formData.height_inches) || 0);
      const weightLbs = parseFloat(formData.weight);

      // Use upsert to handle both insert and update cases
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          age: parseInt(formData.age),
          height: heightInches,
          weight: weightLbs,
          training_age: parseInt(formData.training_age),
          split_preference: formData.split_preference,
          training_goals: formData.training_goals,
          equipment: equipment,
          unit_preference: 'imperial',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        setError(upsertError.message)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Show nothing until auth check completes (middleware handles redirect)
  if (!authChecked) {
    return (
      <>
        <AuraBackground />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-slate-400 mt-2">
              Help your AI coach understand your training background
            </p>
          </div>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4" />
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="13"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="25"
                  />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Ruler className="w-4 h-4" />
                      Height (ft / in)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="3"
                        max="8"
                        value={formData.height_feet}
                        onChange={(e) => setFormData({ ...formData, height_feet: e.target.value })}
                        className="w-1/2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="5"
                        aria-label="Height feet"
                      />
                      <input
                        type="number"
                        required
                        min="0"
                        max="11"
                        value={formData.height_inches}
                        onChange={(e) => setFormData({ ...formData, height_inches: e.target.value })}
                        className="w-1/2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="10"
                        aria-label="Height inches"
                      />
                    </div>
                  </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Weight className="w-4 h-4" />
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    required
                    min="66"
                    max="660"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="165"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Training Age (months)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="600"
                    value={formData.training_age}
                    onChange={(e) => setFormData({ ...formData, training_age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="12"
                  />
                  <p className="text-xs text-slate-500 mt-1">How long you&apos;ve been training</p>
                </div>
              </div>

              {/* Training Split */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Dumbbell className="w-4 h-4" />
                  Preferred Training Split
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {splitOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                        formData.split_preference === option.value
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="split"
                        value={option.value}
                        checked={formData.split_preference === option.value}
                        onChange={(e) => setFormData({ ...formData, split_preference: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-sm text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Training Goals */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Target className="w-4 h-4" />
                  Training Goals (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.training_goals.includes(goal)
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Dumbbell className="w-4 h-4" />
                  Available Equipment
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Your AI coach will only suggest exercises you have equipment for.
                </p>
                <EquipmentSelector value={equipment} onChange={setEquipment} />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || formData.training_goals.length === 0}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}

