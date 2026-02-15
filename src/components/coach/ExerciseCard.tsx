/**
 * Exercise Card Component
 *
 * Displays a single exercise from the AI-generated workout
 * with beautiful glassmorphic styling and animations.
 */

'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Clock, Target, Zap } from 'lucide-react';

interface ExerciseCardProps {
  exercise: {
    name: string;
    muscleGroups: string[];
    sets: number;
    targetReps: string;
    targetRIR: string;
    restSeconds: number;
    coachNote: string;
  };
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const restMinutes = Math.floor(exercise.restSeconds / 60);
  const restRemainder = exercise.restSeconds % 60;
  const restDisplay =
    restMinutes > 0
      ? `${restMinutes}:${restRemainder.toString().padStart(2, '0')}`
      : `${exercise.restSeconds}s`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Exercise number */}
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-sm mb-2">
              {index + 1}
            </div>

            {/* Exercise name */}
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              {exercise.name}
            </h3>

            {/* Muscle groups */}
            <div className="flex flex-wrap gap-1 mt-2">
              {exercise.muscleGroups.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Dumbbell className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Sets */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Target className="w-3 h-3" />
              <span>Sets</span>
            </div>
            <div className="text-xl font-bold text-white">{exercise.sets}</div>
          </div>

          {/* Reps */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Zap className="w-3 h-3" />
              <span>Reps</span>
            </div>
            <div className="text-xl font-bold text-white">{exercise.targetReps}</div>
          </div>

          {/* RIR */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Target className="w-3 h-3" />
              <span>RIR</span>
            </div>
            <div className="text-xl font-bold text-white">{exercise.targetRIR}</div>
          </div>

          {/* Rest */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>Rest</span>
            </div>
            <div className="text-xl font-bold text-white">{restDisplay}</div>
          </div>
        </div>

        {/* Coach note */}
        {exercise.coachNote && (
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">💡</span>
              </div>
              <div>
                <div className="text-xs text-purple-300 font-semibold mb-1">Coach Note</div>
                <p className="text-sm text-slate-300">{exercise.coachNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-purple-500/5 blur-xl" />
      </div>
    </motion.div>
  );
}

