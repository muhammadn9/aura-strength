'use client'

/**
 * Active Workout Session Page
 *
 * Live workout tracking with set logging
 */

import { useState } from 'react';
import { useWorkoutSession } from '@/components/workout/WorkoutSessionProvider';
import AuraBackground from '@/components/aura/AuraBackground';
import GlassCard from '@/components/aura/GlassCard';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pause,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkoutSessionPage() {
  const router = useRouter();
  const {
    session,
    isLoading,
    getCurrentExercise,
    goToNextExercise,
    goToPreviousExercise,
    logSet,
    pauseSession,
    resumeSession,
    endSession,
  } = useWorkoutSession();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentExercise = getCurrentExercise();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <p className="text-white">No active session. Redirecting...</p>
        </GlassCard>
      </div>
    );
  }

  const handleLogSet = async () => {
    if (!currentExercise || !weight || !reps || !rir) return;

    try {
      await logSet(session.currentExerciseIndex, {
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rir: parseInt(rir),
        completed: true,
      });

      // Clear inputs
      setWeight('');
      setReps('');
      setRir('');
    } catch (err) {
      console.error('Failed to log set:', err);
    }
  };

  const handleEndWorkout = async () => {
    try {
      await endSession();
    } catch (err) {
      console.error('Failed to end workout:', err);
    }
  };

  const isPaused = session.status === 'paused';
  const completedSets = currentExercise?.completedSets.length || 0;
  const targetSets = currentExercise?.targetSets || 0;
  const progress = (completedSets / targetSets) * 100;

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{session.workoutType}</h1>
              <p className="text-slate-400 text-sm">
                Exercise {session.currentExerciseIndex + 1} of {session.exercises.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => isPaused ? resumeSession() : pauseSession()}
                className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Exercise */}
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            {currentExercise && (
              <div>
                {/* Exercise Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{currentExercise.name}</h2>
                    <p className="text-slate-400 text-sm">
                      {currentExercise.muscleGroups.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Sets: {completedSets}/{targetSets}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Coach Note */}
                <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-indigo-300 text-sm">
                    <strong>Coach:</strong> {currentExercise.coachNote}
                  </p>
                </div>

                {/* Target Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Target Reps</p>
                    <p className="text-white font-bold">{currentExercise.targetReps}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Target RIR</p>
                    <p className="text-white font-bold">{currentExercise.targetRIR}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Rest</p>
                    <p className="text-white font-bold">{currentExercise.restSeconds}s</p>
                  </div>
                </div>

                {/* Set Logging Form */}
                {completedSets < targetSets && !isPaused && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Log Set #{completedSets + 1}</h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="60"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Reps</label>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">RIR</label>
                        <input
                          type="number"
                          value={rir}
                          onChange={(e) => setRir(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="2"
                          min="0"
                          max="5"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleLogSet}
                      disabled={!weight || !reps || !rir}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Log Set
                    </button>
                  </div>
                )}

                {/* Completed Sets */}
                {completedSets > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Completed Sets</h3>
                    <div className="space-y-2">
                      {currentExercise.completedSets.map((set, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <span className="text-slate-400">Set {set.setNumber}</span>
                          <div className="flex gap-4 text-white">
                            <span>{set.weight}kg</span>
                            <span>{set.reps} reps</span>
                            <span className="text-purple-400">{set.rir} RIR</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Navigation */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={goToPreviousExercise}
              disabled={session.currentExerciseIndex === 0}
              className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            {completedSets >= targetSets ? (
              session.currentExerciseIndex === session.exercises.length - 1 ? (
                <button
                  onClick={handleEndWorkout}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition text-white font-semibold"
                >
                  Finish Workout
                </button>
              ) : (
                <button
                  onClick={goToNextExercise}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition text-white font-semibold flex items-center justify-center gap-2"
                >
                  Next Exercise
                  <ChevronRight className="w-5 h-5" />
                </button>
              )
            ) : (
              <button
                disabled
                className="flex-1 py-3 bg-white/5 rounded-lg cursor-not-allowed text-slate-500"
              >
                Complete all sets first
              </button>
            )}
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <GlassCard className="max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Exit Workout?</h3>
              <p className="text-slate-300 mb-6">
                Your progress has been auto-saved. You can return to this workout later.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition text-red-400"
                >
                  Exit
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </>
  );
}

