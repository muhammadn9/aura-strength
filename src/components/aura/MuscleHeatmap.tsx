'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface MuscleGroup {
  id: string
  name: string
  volume: number // 0-100 scale
}

export default function MuscleHeatmap() {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null)

  // Mock data - will be replaced with real data from Supabase
  const muscleData: MuscleGroup[] = [
    { id: 'chest', name: 'Chest', volume: 75 },
    { id: 'front-delts', name: 'Front Delts', volume: 60 },
    { id: 'biceps', name: 'Biceps', volume: 45 },
    { id: 'quads', name: 'Quads', volume: 80 },
    { id: 'lats', name: 'Lats', volume: 55 },
    { id: 'rear-delts', name: 'Rear Delts', volume: 40 },
    { id: 'triceps', name: 'Triceps', volume: 70 },
    { id: 'glutes', name: 'Glutes', volume: 50 },
    { id: 'hamstrings', name: 'Hamstrings', volume: 65 },
    { id: 'traps', name: 'Traps', volume: 35 },
  ]

  const getMuscleOpacity = (muscleId: string) => {
    const muscle = muscleData.find(m => m.id === muscleId)
    return muscle ? muscle.volume / 100 : 0.1
  }

  const getMuscleInfo = (muscleId: string) => {
    return muscleData.find(m => m.id === muscleId)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* View Toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setView('front')}
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
            <FrontView
              getMuscleOpacity={getMuscleOpacity}
              onMuscleHover={setHoveredMuscle}
            />
          ) : (
            <BackView
              getMuscleOpacity={getMuscleOpacity}
              onMuscleHover={setHoveredMuscle}
            />
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
                  <p className="text-xs text-purple-400">Volume: {muscle.volume}%</p>
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

// Front View Component
function FrontView({
  getMuscleOpacity,
  onMuscleHover
}: {
  getMuscleOpacity: (id: string) => number
  onMuscleHover: (id: string | null) => void
}) {
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      {/* Head */}
      <ellipse cx="100" cy="30" rx="20" ry="25" fill="#1e293b" />

      {/* Chest */}
      <path
        d="M 75 60 Q 75 80, 85 90 L 85 110 L 75 110 Q 70 85, 70 60 Z"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('chest')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('chest')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <path
        d="M 125 60 Q 125 80, 115 90 L 115 110 L 125 110 Q 130 85, 130 60 Z"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('chest')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('chest')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Front Delts */}
      <ellipse
        cx="65" cy="70" rx="12" ry="18"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('front-delts')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('front-delts')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <ellipse
        cx="135" cy="70" rx="12" ry="18"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('front-delts')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('front-delts')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Biceps */}
      <ellipse
        cx="55" cy="120" rx="10" ry="25"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('biceps')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('biceps')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <ellipse
        cx="145" cy="120" rx="10" ry="25"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('biceps')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('biceps')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Core/Abs */}
      <rect
        x="85" y="115" width="30" height="50" rx="5"
        fill="rgba(168, 85, 247, 0.2)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* Quads */}
      <rect
        x="75" y="200" width="15" height="60" rx="7"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('quads')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('quads')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <rect
        x="110" y="200" width="15" height="60" rx="7"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('quads')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('quads')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Torso/Body Connection */}
      <rect x="80" y="55" width="40" height="15" fill="#1e293b" />
      <rect x="85" y="165" width="30" height="35" fill="#1e293b" />
    </svg>
  )
}

// Back View Component
function BackView({
  getMuscleOpacity,
  onMuscleHover
}: {
  getMuscleOpacity: (id: string) => number
  onMuscleHover: (id: string | null) => void
}) {
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      {/* Head */}
      <ellipse cx="100" cy="30" rx="20" ry="25" fill="#1e293b" />

      {/* Traps */}
      <path
        d="M 80 50 L 100 60 L 120 50 L 120 70 L 100 65 L 80 70 Z"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('traps')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('traps')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Rear Delts */}
      <ellipse
        cx="65" cy="75" rx="12" ry="15"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('rear-delts')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('rear-delts')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <ellipse
        cx="135" cy="75" rx="12" ry="15"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('rear-delts')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('rear-delts')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Lats */}
      <path
        d="M 70 85 Q 60 110, 65 140 L 85 145 L 85 95 Z"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('lats')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('lats')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <path
        d="M 130 85 Q 140 110, 135 140 L 115 145 L 115 95 Z"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('lats')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('lats')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Triceps */}
      <ellipse
        cx="55" cy="120" rx="8" ry="25"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('triceps')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('triceps')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <ellipse
        cx="145" cy="120" rx="8" ry="25"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('triceps')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('triceps')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Lower Back */}
      <rect
        x="85" y="145" width="30" height="30" rx="5"
        fill="rgba(168, 85, 247, 0.2)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* Glutes */}
      <ellipse
        cx="82" cy="190" rx="15" ry="20"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('glutes')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('glutes')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <ellipse
        cx="118" cy="190" rx="15" ry="20"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('glutes')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('glutes')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Hamstrings */}
      <rect
        x="75" y="215" width="15" height="55" rx="7"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('hamstrings')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('hamstrings')}
        onMouseLeave={() => onMuscleHover(null)}
      />
      <rect
        x="110" y="215" width="15" height="55" rx="7"
        fill={`rgba(168, 85, 247, ${getMuscleOpacity('hamstrings')})`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        className="cursor-pointer transition-all hover:brightness-125"
        onMouseEnter={() => onMuscleHover('hamstrings')}
        onMouseLeave={() => onMuscleHover(null)}
      />

      {/* Body Connection */}
      <rect x="80" y="55" width="40" height="30" fill="#1e293b" />
      <rect x="85" y="175" width="30" height="15" fill="#1e293b" />
    </svg>
  )
}

