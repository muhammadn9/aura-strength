'use client';

/**
 * End-of-Workout Summary Component
 *
 * Displays a comprehensive summary at the end of a workout including:
 * - Workout stats (duration, exercises, sets, volume)
 * - PRs achieved during this session
 * - Joint health feedback form
 * - Energy level rating
 * - Overall notes
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Dumbbell,
  Activity,
  Heart,
  Zap,
  MessageSquare,
  Check,
  ChevronRight,
  Flame,
  TrendingUp,
} from 'lucide-react';
import GlassCard from '@/components/aura/GlassCard';
import { WorkoutSession, SessionSet } from '@/types/session';

interface WorkoutSummaryProps {
  session: WorkoutSession;
  prsAchieved: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    prType: 'weight' | 'volume' | 'reps';
  }>;
  onComplete: (feedback: WorkoutFeedback) => void;
  isLoading?: boolean;
}

export interface WorkoutFeedback {
  jointHealth: number; // 1-5
  energyLevel: number; // 1-5
  overallNotes: string;
  jointNotes?: string;
}

// Joint health options
const JOINT_HEALTH_OPTIONS = [
  { value: 1, label: 'Very Sore', emoji: '😰', color: 'text-red-400' },
  { value: 2, label: 'Some Pain', emoji: '😟', color: 'text-orange-400' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'text-yellow-400' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'text-green-400' },
  { value: 5, label: 'Great', emoji: '💪', color: 'text-emerald-400' },
];

// Energy level options
const ENERGY_LEVEL_OPTIONS = [
  { value: 1, label: 'Exhausted', emoji: '😴', color: 'text-red-400' },
  { value: 2, label: 'Tired', emoji: '😮‍💨', color: 'text-orange-400' },
  { value: 3, label: 'Moderate', emoji: '😊', color: 'text-yellow-400' },
  { value: 4, label: 'Energized', emoji: '⚡', color: 'text-green-400' },
  { value: 5, label: 'Pumped', emoji: '🔥', color: 'text-emerald-400' },
];

export default function WorkoutSummary({
  session,
  prsAchieved,
  onComplete,
  isLoading = false,
}: WorkoutSummaryProps) {
  const [jointHealth, setJointHealth] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [overallNotes, setOverallNotes] = useState('');
  const [jointNotes, setJointNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<'stats' | 'feedback'>('stats');

  // Calculate workout stats
  const stats = useMemo(() => {
    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60);

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    session.exercises.forEach(exercise => {
      exercise.completedSets.forEach((set: SessionSet) => {
        if (set.completed && set.weight !== null && set.reps !== null) {
          totalSets++;
          totalReps += set.reps;
          totalVolume += set.weight * set.reps;
        }
      });
    });

    return {
      duration,
      exerciseCount: session.exercises.length,
      totalSets,
      totalReps,
      totalVolume: Math.round(totalVolume),
    };
  }, [session]);

  const handleComplete = () => {
    onComplete({
      jointHealth,
      energyLevel,
      overallNotes,
      jointNotes: jointNotes || undefined,
    });
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === 'stats' ? (
            <GlassCard className="p-6">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Workout Complete! 🎉
                </h1>
                <p className="text-slate-400">{session.workoutType}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 rounded-xl p-4 text-center"
                >
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.duration}</p>
                  <p className="text-sm text-slate-400">Minutes</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 rounded-xl p-4 text-center"
                >
                  <Dumbbell className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.exerciseCount}</p>
                  <p className="text-sm text-slate-400">Exercises</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 rounded-xl p-4 text-center"
                >
                  <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalSets}</p>
                  <p className="text-sm text-slate-400">Total Sets</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/5 rounded-xl p-4 text-center"
                >
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalVolume.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total kg</p>
                </motion.div>
              </div>

              {/* PRs Achieved */}
              {prsAchieved.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    PRs Achieved ({prsAchieved.length})
                  </h3>
                  <div className="space-y-2">
                    {prsAchieved.map((pr, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-white font-medium">{pr.exerciseName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{pr.weight}kg × {pr.reps}</p>
                          <p className="text-xs text-yellow-400 uppercase">{pr.prType} PR</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => setCurrentStep('feedback')}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition flex items-center justify-center gap-2"
              >
                Continue to Feedback
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </GlassCard>
          ) : (
            <GlassCard className="p-6">
              {/* Feedback Form */}
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                How do you feel?
              </h2>

              {/* Joint Health */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-white font-medium mb-4">
                  <Heart className="w-5 h-5 text-red-400" />
                  Joint Health
                </label>
                <div className="flex gap-2 justify-center">
                  {JOINT_HEALTH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setJointHealth(option.value)}
                      aria-label={`Rate joint health as ${option.label} (${option.value} out of 5)`}
                      className={`flex flex-col items-center p-3 rounded-xl transition ${
                        jointHealth === option.value
                          ? 'bg-purple-500/30 border border-purple-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl mb-1">{option.emoji}</span>
                      <span className={`text-xs ${jointHealth === option.value ? option.color : 'text-slate-400'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                {jointHealth <= 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <input
                      type="text"
                      value={jointNotes}
                      onChange={(e) => setJointNotes(e.target.value)}
                      placeholder="Which joints? Any specific pain?"
                      className="w-full px-4 py-3 bg-white/5 border border-red-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </motion.div>
                )}
              </div>

              {/* Energy Level */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-white font-medium mb-4">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Energy Level
                </label>
                <div className="flex gap-2 justify-center">
                  {ENERGY_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEnergyLevel(option.value)}
                      aria-label={`Rate energy level as ${option.label} (${option.value} out of 5)`}
                      className={`flex flex-col items-center p-3 rounded-xl transition ${
                        energyLevel === option.value
                          ? 'bg-purple-500/30 border border-purple-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl mb-1">{option.emoji}</span>
                      <span className={`text-xs ${energyLevel === option.value ? option.color : 'text-slate-400'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Notes */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-white font-medium mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Overall Notes (Optional)
                </label>
                <textarea
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  placeholder="How was the workout? Any thoughts for next time?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Complete Button */}
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Complete Workout
                  </>
                )}
              </button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}

