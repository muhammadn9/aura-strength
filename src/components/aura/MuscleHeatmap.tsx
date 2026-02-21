'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMuscleVolumeData } from '@/lib/utils/muscle-volume'

interface MuscleGroup {
  id: string
  name: string
  volume: number
  totalSets: number
  lastWorked: string | null
}

const MUSCLE_NAME_TO_ID: Record<string, string> = {
  'Chest': 'chest',
  'Front Delts': 'front-delts',
  'Biceps': 'biceps',
  'Quads': 'quads',
  'Lats': 'lats',
  'Rear Delts': 'rear-delts',
  'Triceps': 'triceps',
  'Glutes': 'glutes',
  'Hamstrings': 'hamstrings',
  'Traps': 'traps',
  'Core': 'core',
  'Calves': 'calves',
  'Forearms': 'forearms',
}

export default function MuscleHeatmap() {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null)
  const [muscleData, setMuscleData] = useState<MuscleGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVolumeData = async () => {
      const supabase = createClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        const volumeData = await getMuscleVolumeData(user.id, 7)

        const muscles: MuscleGroup[] = Object.entries(volumeData).map(([name, data]) => ({
          id: MUSCLE_NAME_TO_ID[name] || name.toLowerCase().replace(' ', '-'),
          name,
          volume: data.intensity,
          totalSets: data.totalSets,
          lastWorked: data.lastWorked,
        }))

        setMuscleData(muscles)
      } catch (error) {
        console.error('Failed to fetch muscle volume data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVolumeData()
  }, [])

  const getMuscleOpacity = (muscleId: string) => {
    const muscle = muscleData.find(m => m.id === muscleId)
    return muscle ? Math.max(muscle.volume / 100, 0.08) : 0.08
  }

  const getMuscleInfo = (muscleId: string) => {
    return muscleData.find(m => m.id === muscleId)
  }

  const muscleProps = (id: string) => ({
    fill: `rgba(168, 85, 247, ${getMuscleOpacity(id)})`,
    stroke: 'rgba(168, 85, 247, 0.3)',
    strokeWidth: 0.5,
    className: 'cursor-pointer transition-all duration-200 hover:brightness-150',
    onMouseEnter: () => setHoveredMuscle(id),
    onMouseLeave: () => setHoveredMuscle(null),
  })

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* View Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setView('front')}
          aria-label="Front view"
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            view === 'front'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          Front
        </button>
        <button
          onClick={() => setView('back')}
          aria-label="Back view"
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            view === 'back'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          Back
        </button>
      </div>

      {/* Heatmap Display */}
      <div className="relative aspect-[1/2] max-h-[600px]">
        <motion.div
          key={view}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'front' ? (
            <FrontView muscleProps={muscleProps} />
          ) : (
            <BackView muscleProps={muscleProps} />
          )}
        </motion.div>

        {/* Hover Info */}
        {hoveredMuscle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 backdrop-blur-sm border border-purple-500/30 rounded-lg"
          >
            {(() => {
              const muscle = getMuscleInfo(hoveredMuscle)
              return muscle ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{muscle.name}</p>
                  <p className="text-xs text-purple-400">
                    {muscle.totalSets} sets ({muscle.volume}% volume)
                  </p>
                  {muscle.lastWorked && (
                    <p className="text-xs text-slate-500 mt-1">
                      Last: {new Date(muscle.lastWorked).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : null
            })()}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="text-sm text-slate-400">Low Volume</span>
        <div className="flex gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, i) => (
            <div
              key={i}
              className="w-8 h-4 rounded"
              style={{ backgroundColor: `rgba(168, 85, 247, ${opacity})` }}
            />
          ))}
        </div>
        <span className="text-sm text-slate-400">High Volume</span>
      </div>
    </div>
  )
}

type MusclePropsFunc = (id: string) => {
  fill: string;
  stroke: string;
  strokeWidth: number;
  className: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// ============================================================================
// Front View - Anatomical silhouette with proper muscle shapes
// ============================================================================
function FrontView({ muscleProps }: { muscleProps: MusclePropsFunc }) {
  return (
    <svg viewBox="0 0 200 440" className="w-full h-full" role="img" aria-label="Front muscle view">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Head */}
      <ellipse cx="100" cy="28" rx="16" ry="20" fill="#1e293b" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      {/* Neck */}
      <rect x="93" y="47" width="14" height="12" fill="#1e293b" />

      {/* === FRONT DELTS === */}
      <path d="M 68 58 Q 55 60, 52 75 Q 52 88, 58 95 L 72 85 Q 72 70, 68 58 Z" {...muscleProps('front-delts')} />
      <path d="M 132 58 Q 145 60, 148 75 Q 148 88, 142 95 L 128 85 Q 128 70, 132 58 Z" {...muscleProps('front-delts')} />

      {/* === CHEST === */}
      <path d="M 72 62 Q 75 58, 95 60 L 95 82 Q 85 92, 72 85 Z" {...muscleProps('chest')} filter="url(#glow)" />
      <path d="M 128 62 Q 125 58, 105 60 L 105 82 Q 115 92, 128 85 Z" {...muscleProps('chest')} filter="url(#glow)" />

      {/* === BICEPS === */}
      <path d="M 54 98 Q 48 105, 46 125 Q 46 140, 50 148 L 58 145 Q 62 130, 62 115 Q 62 103, 58 98 Z" {...muscleProps('biceps')} />
      <path d="M 146 98 Q 152 105, 154 125 Q 154 140, 150 148 L 142 145 Q 138 130, 138 115 Q 138 103, 142 98 Z" {...muscleProps('biceps')} />

      {/* === FOREARMS === */}
      <path d="M 48 150 Q 44 160, 42 178 Q 42 192, 44 200 L 52 198 Q 54 185, 55 170 Q 55 158, 52 150 Z" {...muscleProps('forearms')} />
      <path d="M 152 150 Q 156 160, 158 178 Q 158 192, 156 200 L 148 198 Q 146 185, 145 170 Q 145 158, 148 150 Z" {...muscleProps('forearms')} />

      {/* === CORE / ABS (segmented) === */}
      <rect x="88" y="88" width="10" height="12" rx="2" {...muscleProps('core')} />
      <rect x="102" y="88" width="10" height="12" rx="2" {...muscleProps('core')} />
      <rect x="88" y="103" width="10" height="12" rx="2" {...muscleProps('core')} />
      <rect x="102" y="103" width="10" height="12" rx="2" {...muscleProps('core')} />
      <rect x="88" y="118" width="10" height="12" rx="2" {...muscleProps('core')} />
      <rect x="102" y="118" width="10" height="12" rx="2" {...muscleProps('core')} />
      {/* Obliques */}
      <path d="M 78 90 Q 75 105, 78 130 L 86 128 L 86 88 Z" {...muscleProps('core')} />
      <path d="M 122 90 Q 125 105, 122 130 L 114 128 L 114 88 Z" {...muscleProps('core')} />

      {/* Hip area */}
      <path d="M 80 135 Q 82 148, 80 165 L 100 170 L 120 165 Q 118 148, 120 135 Z" fill="#1e293b" />

      {/* === QUADS === */}
      <path d="M 76 170 Q 70 195, 68 230 Q 68 260, 72 280 L 82 280 Q 86 260, 87 240 Q 90 210, 92 185 L 95 170 Z" {...muscleProps('quads')} filter="url(#glow)" />
      <path d="M 124 170 Q 130 195, 132 230 Q 132 260, 128 280 L 118 280 Q 114 260, 113 240 Q 110 210, 108 185 L 105 170 Z" {...muscleProps('quads')} filter="url(#glow)" />

      {/* Knees */}
      <ellipse cx="78" cy="288" rx="8" ry="6" fill="#1e293b" />
      <ellipse cx="122" cy="288" rx="8" ry="6" fill="#1e293b" />

      {/* === CALVES === */}
      <path d="M 72 296 Q 68 315, 68 340 Q 68 365, 70 380 L 80 380 Q 82 365, 82 340 Q 82 318, 80 296 Z" {...muscleProps('calves')} />
      <path d="M 128 296 Q 132 315, 132 340 Q 132 365, 130 380 L 120 380 Q 118 365, 118 340 Q 118 318, 120 296 Z" {...muscleProps('calves')} />

      {/* Feet */}
      <ellipse cx="75" cy="388" rx="10" ry="5" fill="#1e293b" />
      <ellipse cx="125" cy="388" rx="10" ry="5" fill="#1e293b" />

      {/* Hands */}
      <ellipse cx="46" cy="206" rx="5" ry="7" fill="#1e293b" />
      <ellipse cx="154" cy="206" rx="5" ry="7" fill="#1e293b" />
    </svg>
  )
}

// ============================================================================
// Back View - Anatomical silhouette with proper muscle shapes
// ============================================================================
function BackView({ muscleProps }: { muscleProps: MusclePropsFunc }) {
  return (
    <svg viewBox="0 0 200 440" className="w-full h-full" role="img" aria-label="Back muscle view">
      <defs>
        <filter id="glowBack">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Head */}
      <ellipse cx="100" cy="28" rx="16" ry="20" fill="#1e293b" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      {/* Neck */}
      <rect x="93" y="47" width="14" height="12" fill="#1e293b" />

      {/* === TRAPS === */}
      <path d="M 80 52 Q 85 48, 100 54 L 100 72 Q 90 68, 82 64 Z" {...muscleProps('traps')} />
      <path d="M 120 52 Q 115 48, 100 54 L 100 72 Q 110 68, 118 64 Z" {...muscleProps('traps')} />

      {/* === REAR DELTS === */}
      <path d="M 68 58 Q 55 62, 52 78 Q 54 90, 58 96 L 70 88 Q 68 72, 68 58 Z" {...muscleProps('rear-delts')} />
      <path d="M 132 58 Q 145 62, 148 78 Q 146 90, 142 96 L 130 88 Q 132 72, 132 58 Z" {...muscleProps('rear-delts')} />

      {/* === LATS (wide V-shape) === */}
      <path d="M 72 72 Q 65 90, 62 108 Q 60 120, 62 135 L 85 140 L 88 90 Q 82 78, 72 72 Z" {...muscleProps('lats')} filter="url(#glowBack)" />
      <path d="M 128 72 Q 135 90, 138 108 Q 140 120, 138 135 L 115 140 L 112 90 Q 118 78, 128 72 Z" {...muscleProps('lats')} filter="url(#glowBack)" />

      {/* === TRICEPS === */}
      <path d="M 54 98 Q 48 110, 46 130 Q 46 142, 50 148 L 58 145 Q 60 132, 60 118 Q 60 105, 56 98 Z" {...muscleProps('triceps')} />
      <path d="M 146 98 Q 152 110, 154 130 Q 154 142, 150 148 L 142 145 Q 140 132, 140 118 Q 140 105, 144 98 Z" {...muscleProps('triceps')} />

      {/* === FOREARMS === */}
      <path d="M 48 150 Q 44 162, 42 180 Q 42 194, 44 200 L 52 198 Q 54 186, 55 172 Q 55 160, 52 150 Z" {...muscleProps('forearms')} />
      <path d="M 152 150 Q 156 162, 158 180 Q 158 194, 156 200 L 148 198 Q 146 186, 145 172 Q 145 160, 148 150 Z" {...muscleProps('forearms')} />

      {/* === LOWER BACK / Erectors === */}
      <path d="M 90 90 L 90 140 Q 95 145, 100 145 Q 105 145, 110 140 L 110 90 Q 105 85, 100 85 Q 95 85, 90 90 Z" fill="rgba(168, 85, 247, 0.15)" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />

      {/* === GLUTES === */}
      <path d="M 78 155 Q 72 168, 72 182 Q 72 195, 78 200 L 98 202 Q 100 185, 98 168 L 88 155 Z" {...muscleProps('glutes')} filter="url(#glowBack)" />
      <path d="M 122 155 Q 128 168, 128 182 Q 128 195, 122 200 L 102 202 Q 100 185, 102 168 L 112 155 Z" {...muscleProps('glutes')} filter="url(#glowBack)" />

      {/* === HAMSTRINGS === */}
      <path d="M 74 205 Q 70 225, 68 250 Q 68 270, 72 282 L 84 282 Q 88 268, 88 248 Q 88 225, 92 205 Z" {...muscleProps('hamstrings')} filter="url(#glowBack)" />
      <path d="M 126 205 Q 130 225, 132 250 Q 132 270, 128 282 L 116 282 Q 112 268, 112 248 Q 112 225, 108 205 Z" {...muscleProps('hamstrings')} filter="url(#glowBack)" />

      {/* Knees */}
      <ellipse cx="78" cy="288" rx="8" ry="6" fill="#1e293b" />
      <ellipse cx="122" cy="288" rx="8" ry="6" fill="#1e293b" />

      {/* === CALVES (gastrocnemius) === */}
      <path d="M 70 296 Q 65 310, 64 332 Q 66 358, 70 375 L 80 378 Q 84 358, 85 335 Q 84 312, 82 296 Z" {...muscleProps('calves')} />
      <path d="M 130 296 Q 135 310, 136 332 Q 134 358, 130 375 L 120 378 Q 116 358, 115 335 Q 116 312, 118 296 Z" {...muscleProps('calves')} />

      {/* Feet */}
      <ellipse cx="75" cy="386" rx="10" ry="5" fill="#1e293b" />
      <ellipse cx="125" cy="386" rx="10" ry="5" fill="#1e293b" />

      {/* Hands */}
      <ellipse cx="46" cy="206" rx="5" ry="7" fill="#1e293b" />
      <ellipse cx="154" cy="206" rx="5" ry="7" fill="#1e293b" />
    </svg>
  )
}
