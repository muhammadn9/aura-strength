'use client'

/**
 * Active Workout Session Page
 *
 * Live workout tracking with set logging
 */

import { useState, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Quick feedback tags for sets
const FEEDBACK_TAGS = [
  { id: 'good-form', label: '✓ Good Form', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'shaky', label: '⚠ Shaky', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'joint-pain', label: '🔴 Joint Pain', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'easy', label: '💪 Easy', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'hard', label: '🔥 Hard', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'pr-attempt', label: '🏆 PR Attempt', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
] as const;

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentExercise = getCurrentExercise();

  // Redirect if no active session
  useEffect(() => {
    if (!isLoading && !session) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, isLoading, router]);

  // Toggle feedback tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Build feedback string from tags and note
  const buildFeedbackString = (): string | undefined => {
    const parts: string[] = [];

    if (selectedTags.length > 0) {
      const tagLabels = selectedTags.map(id =>
        FEEDBACK_TAGS.find(t => t.id === id)?.label.replace(/^[^\w]*\s*/, '') || id
      );
      parts.push(`[${tagLabels.join(', ')}]`);
    }

    if (feedbackNote.trim()) {
      parts.push(feedbackNote.trim());
    }

    return parts.length > 0 ? parts.join(' ') : undefined;
  };

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

    setActionError(null);
    try {
      const feedback = buildFeedbackString();

      await logSet(session.currentExerciseIndex, {
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rir: parseInt(rir),
        completed: true,
        feedback,
      });

      // Clear inputs
      setWeight('');
      setReps('');
      setRir('');
      setSelectedTags([]);
      setFeedbackNote('');
    } catch (err) {
      console.error('Failed to log set:', err);
      setActionError('Failed to log set. Please try again.');
    }
  };

  const handleEndWorkout = async () => {
    setActionError(null);
    try {
      await endSession();
    } catch (err) {
      console.error('Failed to end workout:', err);
      setActionError('Failed to save workout. Please try again.');
    }
  };

  const isPaused = session.status === 'paused';
  const completedSets = currentExercise?.completedSets.length || 0;
  const targetSets = currentExercise?.targetSets || 1; // Minimum 1 to avoid division by zero
  const progress = targetSets > 0 ? (completedSets / targetSets) * 100 : 0;

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-4">
        {/* Error Alert */}
        {actionError && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{actionError}</p>
              <button
                onClick={() => setActionError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
                          min="0"
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
                          min="1"
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

                    {/* Per-Set Feedback Section */}
                    <div className="space-y-3">
                      <label className="block text-sm text-slate-400">How did this set feel? (optional)</label>

                      {/* Quick Tags */}
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_TAGS.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                              selectedTags.includes(tag.id)
                                ? `${tag.color} border-current`
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>

                      {/* Optional Note */}
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        placeholder="Add a note (e.g., 'felt strong', 'grip slipping')..."
                        maxLength={100}
                      />
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
                          className="p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Set {set.setNumber}</span>
                            <div className="flex gap-4 text-white">
                              <span>{set.weight}kg</span>
                              <span>{set.reps} reps</span>
                              <span className="text-purple-400">{set.rir} RIR</span>
                            </div>
                          </div>
                          {set.feedback && (
                            <p className="mt-2 text-sm text-slate-400 italic">
                              {set.feedback}
                            </p>
                          )}
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
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
          >
            <GlassCard className="max-w-md">
              <h3 id="exit-modal-title" className="text-xl font-bold text-white mb-4">Exit Workout?</h3>
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

