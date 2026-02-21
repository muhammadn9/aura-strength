'use client'

/**
 * Active Workout Session Page
 *
 * Live workout tracking with set logging, PR detection, and end-of-workout summary
 */

import { useState, useEffect, useCallback } from 'react';
import { useWorkoutSession } from '@/components/workout/WorkoutSessionProvider';
import AuraBackground from '@/components/aura/AuraBackground';
import GlassCard from '@/components/aura/GlassCard';
import PRCelebration from '@/components/workout/PRCelebration';
import WorkoutSummary, { WorkoutFeedback } from '@/components/workout/WorkoutSummary';
import { checkForPR, getExercisePRs, PRCheckResult, PRRecord } from '@/lib/utils/pr-detection';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pause,
  Play,
  AlertCircle,
  Timer,
  Volume2,
  VolumeX,
  SkipForward,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();
  const {
    session,
    isLoading,
    sessionPRs,
    getCurrentExercise,
    goToNextExercise,
    goToPreviousExercise,
    logSet,
    addPR,
    pauseSession,
    resumeSession,
    endSessionWithFeedback,
  } = useWorkoutSession();

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [initialRestTime, setInitialRestTime] = useState(0);

  // PR Detection State
  const [exercisePRHistory, setExercisePRHistory] = useState<PRRecord[]>([]);
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [currentPRResult, setCurrentPRResult] = useState<PRCheckResult | null>(null);
  const [lastLoggedSet, setLastLoggedSet] = useState<{ weight: number; reps: number } | null>(null);

  // Show summary at end of workout
  const [showSummary, setShowSummary] = useState(false);

  const currentExercise = getCurrentExercise();

  // Play beep sound using Web Audio API
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  // Redirect if no active session
  useEffect(() => {
    if (!isLoading && !session) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, isLoading, router]);

  // Fetch PR history when exercise changes
  useEffect(() => {
    const fetchPRHistory = async () => {
      if (!currentExercise || !session) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const prHistory = await getExercisePRs(currentExercise.name, user.id);
        setExercisePRHistory(prHistory);
      } catch (err) {
        console.error('Failed to fetch PR history:', err);
        setExercisePRHistory([]);
      }
    };

    fetchPRHistory();
  }, [currentExercise?.name, session, supabase]);

  // Rest Timer Countdown
  useEffect(() => {
    if (!isResting || restTimeRemaining <= 0) {
      // Timer finished - play sound
      if (restTimeRemaining === 0 && !isResting) return;
      if (restTimeRemaining <= 0 && isResting) {
        setIsResting(false);
        playBeep();
      }
      return;
    }

    const interval = setInterval(() => {
      setRestTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining, playBeep]);

  // Start rest timer
  const startRestTimer = useCallback((seconds: number) => {
    setInitialRestTime(seconds);
    setRestTimeRemaining(seconds);
    setIsResting(true);
  }, []);

  // Skip rest
  const skipRest = useCallback(() => {
    setIsResting(false);
    setRestTimeRemaining(0);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      const weightNum = parseFloat(weight);
      const repsNum = parseInt(reps);

      // Check for PR before logging
      const prResult = checkForPR(weightNum, repsNum, exercisePRHistory);

      await logSet(session.currentExerciseIndex, {
        weight: weightNum,
        reps: repsNum,
        rir: parseInt(rir),
        completed: true,
        feedback,
        isPR: prResult.isPR,
        prType: prResult.prType,
      });

      // If it's a PR, show celebration and track it
      if (prResult.isPR && prResult.prType) {
        setCurrentPRResult(prResult);
        setLastLoggedSet({ weight: weightNum, reps: repsNum });
        setShowPRCelebration(true);

        // Add to session PRs
        addPR({
          exerciseName: currentExercise.name,
          weight: weightNum,
          reps: repsNum,
          prType: prResult.prType,
        });

        // Add to local PR history for subsequent PR checks
        setExercisePRHistory(prev => [...prev, {
          exerciseName: currentExercise.name,
          weight: weightNum,
          reps: repsNum,
          dateAchieved: new Date().toISOString().split('T')[0],
        }]);
      }

      // Clear inputs
      setWeight('');
      setReps('');
      setRir('');
      setSelectedTags([]);
      setFeedbackNote('');

      // Start rest timer if there are more sets to do (and not showing PR celebration)
      const newCompletedSets = (currentExercise?.completedSets.length || 0) + 1;
      const targetSetsCount = currentExercise?.targetSets || 0;
      if (newCompletedSets < targetSetsCount && currentExercise?.restSeconds && !prResult.isPR) {
        startRestTimer(currentExercise.restSeconds);
      }
    } catch (err) {
      console.error('Failed to log set:', err);
      setActionError('Failed to log set. Please try again.');
    }
  };

  // Handle closing PR celebration
  const handleClosePRCelebration = () => {
    setShowPRCelebration(false);
    setCurrentPRResult(null);
    setLastLoggedSet(null);

    // Start rest timer after celebration if needed
    const newCompletedSets = currentExercise?.completedSets.length || 0;
    const targetSetsCount = currentExercise?.targetSets || 0;
    if (newCompletedSets < targetSetsCount && currentExercise?.restSeconds) {
      startRestTimer(currentExercise.restSeconds);
    }
  };

  const handleEndWorkout = async () => {
    // Show the summary screen instead of immediately ending
    setShowSummary(true);
  };

  const handleSummaryComplete = async (feedback: WorkoutFeedback) => {
    setActionError(null);
    try {
      await endSessionWithFeedback(feedback);
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
                      <div>
                        <label htmlFor="feedback-note" className="sr-only">
                          Additional feedback note
                        </label>
                        <input
                          id="feedback-note"
                          type="text"
                          value={feedbackNote}
                          onChange={(e) => setFeedbackNote(e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                          placeholder="Add a note (e.g., 'felt strong', 'grip slipping')..."
                          maxLength={100}
                          aria-label="Additional feedback note"
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

                {/* Rest Timer */}
                <AnimatePresence>
                  {isResting && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="mt-6"
                    >
                      <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Timer className="w-5 h-5 text-indigo-400" />
                            <span className="text-white font-semibold">Rest Timer</span>
                          </div>
                          <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
                          >
                            {soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-white" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* Countdown Display */}
                        <div className="text-center mb-4">
                          <motion.div
                            key={restTimeRemaining}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-5xl font-bold text-white tabular-nums"
                          >
                            {formatTime(restTimeRemaining)}
                          </motion.div>
                          <p className="text-slate-400 text-sm mt-1">
                            Rest before next set
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: '100%' }}
                            animate={{
                              width: `${initialRestTime > 0 ? (restTimeRemaining / initialRestTime) * 100 : 0}%`
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        {/* Skip Button */}
                        <button
                          onClick={skipRest}
                          className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                        >
                          <SkipForward className="w-4 h-4" />
                          Skip Rest
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Completed Sets */}
                {completedSets > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Completed Sets</h3>
                    <div className="space-y-2">
                      {currentExercise.completedSets.map((set, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            set.isPR 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30' 
                              : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Set {set.setNumber}</span>
                              {set.isPR && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs text-yellow-400 font-medium">
                                  <Trophy className="w-3 h-3" />
                                  PR
                                </span>
                              )}
                            </div>
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

        {/* PR Celebration Modal */}
        {showPRCelebration && currentPRResult && lastLoggedSet && currentExercise && (
          <PRCelebration
            prResult={currentPRResult}
            exerciseName={currentExercise.name}
            weight={lastLoggedSet.weight}
            reps={lastLoggedSet.reps}
            onClose={handleClosePRCelebration}
          />
        )}

        {/* Workout Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 z-50">
            <AuraBackground />
            <WorkoutSummary
              session={session}
              prsAchieved={sessionPRs}
              onComplete={handleSummaryComplete}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </>
  );
}

