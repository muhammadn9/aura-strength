'use client';

/**
 * Workout Detail Component
 *
 * Displays detailed information about a selected workout.
 */

import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/aura/GlassCard';
import {
  X,
  Calendar,
  Clock,
  Dumbbell,
  Trophy,
  MessageSquare,
} from 'lucide-react';

interface WorkoutDetailData {
  id: string;
  date: string;
  workoutType: string;
  durationMinutes: number | null;
  userFeedback: string | null;
  exercises: Array<{
    id: string;
    name: string;
    sets: Array<{
      setNumber: number;
      weight: number;
      reps: number;
      rir: number;
      feedback: string | null;
      isPR: boolean;
    }>;
  }>;
}

interface WorkoutDetailProps {
  workout: WorkoutDetailData | null;
  onClose: () => void;
}

export default function WorkoutDetail({ workout, onClose }: WorkoutDetailProps) {
  if (!workout) {
    return (
      <GlassCard className="h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Select a workout to view details</p>
        </div>
      </GlassCard>
    );
  }

  // Calculate totals
  let totalSets = 0;
  let totalVolume = 0;
  let prCount = 0;

  workout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalSets++;
      totalVolume += set.weight * set.reps;
      if (set.isPR) prCount++;
    });
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={workout.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="sticky top-4"
      >
        <GlassCard>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{workout.workoutType}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(workout.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold">{workout.durationMinutes || '-'}</p>
              <p className="text-xs text-slate-500">mins</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Dumbbell className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold">{totalSets}</p>
              <p className="text-xs text-slate-500">sets</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-bold">{prCount}</p>
              <p className="text-xs text-slate-500">PRs</p>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {workout.exercises.map(exercise => (
              <div key={exercise.id} className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">{exercise.name}</h3>
                <div className="space-y-2">
                  {exercise.sets.map(set => (
                    <div
                      key={set.setNumber}
                      className={`flex items-center justify-between p-2 rounded ${
                        set.isPR ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'
                      }`}
                    >
                      <span className="text-slate-400 text-sm">Set {set.setNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white">{set.weight}kg</span>
                        <span className="text-slate-400">×</span>
                        <span className="text-white">{set.reps}</span>
                        <span className="text-purple-400 text-sm">@{set.rir} RIR</span>
                        {set.isPR && (
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          {workout.userFeedback && (
            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-400 text-sm mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Session Notes</span>
              </div>
              <p className="text-slate-300 text-sm">{workout.userFeedback}</p>
            </div>
          )}

          {/* Total Volume */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">Total Volume</p>
            <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString()} kg</p>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}

