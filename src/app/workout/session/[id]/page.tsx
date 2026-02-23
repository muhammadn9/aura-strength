'use client'

/**
 * Active Workout Session Page — Mobile-First Redesign
 *
 * Fixed header + fixed bottom nav + scrollable middle.
 * No scrolling required to log a set.
 * Supports RIR as single number or range (e.g. "2" or "2-3").
 * Silent PR tracking — shown at end of workout summary only.
 * AI coaching note shown after each set.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkoutSession } from '@/components/workout/WorkoutSessionProvider';
import AuraBackground from '@/components/aura/AuraBackground';
import GlassCard from '@/components/aura/GlassCard';
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
  Sparkles,
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
] as const;

/** Validate RIR: accepts "2" or "2-3" */
function isValidRIR(val: string): boolean {
  if (!val.trim()) return false;
  if (/^\d+$/.test(val.trim())) return parseInt(val) >= 0 && parseInt(val) <= 5;
  if (/^\d+-\d+$/.test(val.trim())) {
    const [lo, hi] = val.split('-').map(Number);
    return lo >= 0 && hi <= 5 && lo <= hi;
  }
  return false;
}

/** Get AI coaching note for a completed set */
async function getAISetNote(
  exerciseName: string,
  loggedWeight: number,
  loggedReps: number,
  loggedRIR: string,
  targetReps: string,
  targetRIR: string,
  feedback: string | undefined,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'set_note',
        exerciseName,
        loggedWeight,
        loggedReps,
        loggedRIR,
        targetReps,
        targetRIR,
        feedback,
      }),
      signal,
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.note || '';
  } catch {
    return '';
  }
}

export default function WorkoutSessionPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    session,
    isLoading,
    isHydrated,
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

  // PR Detection (silent — no celebration modal, shown in summary)
  const [exercisePRHistory, setExercisePRHistory] = useState<PRRecord[]>([]);

  // AI coaching note per set
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiNoteLoading, setAiNoteLoading] = useState(false);

  // Show summary at end of workout
  const [showSummary, setShowSummary] = useState(false);

  const currentExercise = getCurrentExercise();
  const weightInputRef = useRef<HTMLInputElement>(null);
  const aiNoteAbortRef = useRef<AbortController | null>(null);

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
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // Redirect if no active session (only after hydration)
  useEffect(() => {
    if (isHydrated && !isLoading && !session) {
      // router.push does not trigger a setState cascade — safe to call in setTimeout
      // eslint-disable-next-line react-hooks/set-state-in-effect
      const timer = setTimeout(() => router.push('/dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [session, isLoading, isHydrated, router]);

  // Fetch PR history when exercise changes
  useEffect(() => {
    let cancelled = false;
    const fetchPRHistory = async () => {
      if (!currentExercise || !session) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const prHistory = await getExercisePRs(currentExercise.name, user.id);
        if (!cancelled) setExercisePRHistory(prHistory);
      } catch {
        if (!cancelled) setExercisePRHistory([]);
      }
      // Reset inputs for new exercise — pre-fill RIR from target
      if (!cancelled) {
        setAiNote(null);
        setWeight('');
        setReps('');
        const defaultRIR = currentExercise?.targetRIR?.split?.('-')?.[0]?.trim() || '';
        setRir(defaultRIR);
        setSelectedTags([]);
        setFeedbackNote('');
      }
    };
    fetchPRHistory();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.name, session?.id]);

  // Rest Timer Countdown
  useEffect(() => {
    if (!isResting) return;
    if (restTimeRemaining <= 0) {
      const id = setTimeout(() => {
        setIsResting(false);
        playBeep();
      }, 0);
      return () => clearTimeout(id);
    }
    const interval = setInterval(() => setRestTimeRemaining(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining, playBeep]);

  const startRestTimer = useCallback((seconds: number) => {
    setInitialRestTime(seconds);
    setRestTimeRemaining(seconds);
    setIsResting(true);
  }, []);

  const skipRest = useCallback(() => {
    setIsResting(false);
    setRestTimeRemaining(0);
    weightInputRef.current?.focus();
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const buildFeedbackString = (): string | undefined => {
    const parts: string[] = [];
    if (selectedTags.length > 0) {
      const tagLabels = selectedTags.map(id =>
        FEEDBACK_TAGS.find(t => t.id === id)?.label.replace(/^[^\w]*\s*/, '') || id
      );
      parts.push(`[${tagLabels.join(', ')}]`);
    }
    if (feedbackNote.trim()) parts.push(feedbackNote.trim());
    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  if (!isHydrated || (!session && isLoading)) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <GlassCard><p className="text-white">Loading workout session...</p></GlassCard>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <GlassCard><p className="text-white">No active session. Redirecting...</p></GlassCard>
      </div>
    );
  }

  const handleLogSet = async () => {
    if (!currentExercise || !weight || !reps || !rir) return;
    if (!isValidRIR(rir)) {
      setActionError('RIR must be a number (e.g. 2) or range (e.g. 2-3)');
      return;
    }

    setActionError(null);
    setAiNote(null);

    try {
      const feedback = buildFeedbackString();
      const weightNum = parseFloat(weight);
      const repsNum = parseInt(reps);

      // Silent PR check — no modal, tracked for end summary
      let prResult: PRCheckResult = { isPR: false, prType: null, previousBest: null, improvement: null };
      if (Number.isFinite(weightNum) && Number.isFinite(repsNum) && weightNum > 0 && repsNum > 0) {
        prResult = checkForPR(weightNum, repsNum, exercisePRHistory);
      }

      await logSet(session.currentExerciseIndex, {
        weight: weightNum,
        reps: repsNum,
        rir: typeof rir === 'string' && rir.includes('-') ? parseInt(rir.split('-')[0]) : parseInt(rir),
        completed: true,
        feedback,
        isPR: prResult.isPR,
        prType: prResult.prType,
      });

      // Track PR silently
      if (prResult.isPR && prResult.prType) {
        addPR({ exerciseName: currentExercise.name, weight: weightNum, reps: repsNum, prType: prResult.prType });
        setExercisePRHistory(prev => [...prev, {
          exerciseName: currentExercise.name, weight: weightNum, reps: repsNum,
          dateAchieved: new Date().toISOString().split('T')[0],
        }]);
      }

      // Get AI note for this set (non-blocking, cancellable)
      aiNoteAbortRef.current?.abort();
      const controller = new AbortController();
      aiNoteAbortRef.current = controller;
      setAiNoteLoading(true);
      getAISetNote(
        currentExercise.name, weightNum, repsNum, rir,
        currentExercise.targetReps, currentExercise.targetRIR, feedback,
        controller.signal,
      ).then(note => {
        if (!controller.signal.aborted) {
          setAiNote(note || null);
          setAiNoteLoading(false);
        }
      });

      // Clear inputs — pre-fill RIR with target to avoid confusion
      const targetRIRDefault =
        currentExercise?.targetRIR?.split?.('-')?.[0]?.trim() || '';
      setWeight('');
      setReps('');
      setRir(targetRIRDefault);
      setSelectedTags([]);
      setFeedbackNote('');

      // Start rest timer if more sets remain
      const newCompletedSets = (currentExercise?.completedSets.length || 0) + 1;
      if (newCompletedSets < (currentExercise?.targetSets || 0) && currentExercise?.restSeconds) {
        startRestTimer(currentExercise.restSeconds);
      } else {
        weightInputRef.current?.focus();
      }
    } catch {
      setActionError('Failed to log set. Please try again.');
    }
  };

  const handleEndWorkout = () => setShowSummary(true);

  const handleSummaryComplete = async (feedback: WorkoutFeedback) => {
    setActionError(null);
    try {
      await endSessionWithFeedback(feedback);
    } catch {
      setActionError('Failed to save workout. Please try again.');
    }
  };

  const isPaused = session.status === 'paused';
  const completedSets = currentExercise?.completedSets.length || 0;
  const targetSets = currentExercise?.targetSets || 1;
  const progress = targetSets > 0 ? (completedSets / targetSets) * 100 : 0;
  const isLastExercise = session.currentExerciseIndex === session.exercises.length - 1;
  const allSetsDone = completedSets >= targetSets;

  return (
    <>
      <AuraBackground />

      {/* ─── FIXED HEADER ─── */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-white truncate">{session.workoutType}</h1>
            <p className="text-xs text-slate-400">
              Exercise {session.currentExerciseIndex + 1}/{session.exercises.length}
              {currentExercise && ` · Set ${completedSets + (allSetsDone ? 0 : 1)}/${targetSets}`}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <button
              onClick={() => isPaused ? resumeSession() : pauseSession()}
              className="p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
              aria-label="Exit workout"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ─── SCROLLABLE MAIN CONTENT ─── */}
      <div className="pt-20 pb-24 min-h-dvh overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

          {/* Error */}
          {actionError && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm flex-1">{actionError}</p>
              <button type="button" aria-label="Dismiss error" onClick={() => setActionError(null)}>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {currentExercise && (
            <>
              {/* Exercise info */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight">{currentExercise.name}</h2>
                    <p className="text-xs text-slate-400 truncate">{currentExercise.muscleGroups.join(', ')}</p>
                  </div>
                </div>

                {/* Target info row */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Target</p>
                    <p className="text-sm font-bold text-white">{currentExercise.targetReps} reps</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-slate-400">RIR</p>
                    <p className="text-sm font-bold text-white">{currentExercise.targetRIR}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Rest</p>
                    <p className="text-sm font-bold text-white">{currentExercise.restSeconds}s</p>
                  </div>
                </div>

                {/* Coach note */}
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-indigo-300 text-xs">
                    <strong>Coach:</strong> {currentExercise.coachNote}
                  </p>
                </div>
              </GlassCard>

              {/* AI note after set */}
              <AnimatePresence>
                {(aiNote || aiNoteLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-start gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {aiNoteLoading
                      ? <p className="text-purple-300 text-xs animate-pulse">Coach is reviewing your set...</p>
                      : <p className="text-purple-300 text-xs">{aiNote}</p>
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rest timer */}
              <AnimatePresence>
                {isResting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-indigo-400" />
                        <span className="text-white font-semibold text-sm">Rest Timer</span>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-1.5 bg-white/10 rounded-lg"
                        aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                    <div className="text-center mb-3">
                      <motion.div key={restTimeRemaining} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                        className="text-4xl font-bold text-white tabular-nums"
                      >
                        {formatTime(restTimeRemaining)}
                      </motion.div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        animate={{ width: `${initialRestTime > 0 ? (restTimeRemaining / initialRestTime) * 100 : 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <button onClick={skipRest}
                      className="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm flex items-center justify-center gap-2"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Skip Rest
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Set logging form */}
              {allSetsDone && !isPaused ? (
                <GlassCard className="p-4 text-center">
                  <p className="text-green-400 font-semibold text-sm">✓ All {targetSets} sets complete!</p>
                  <p className="text-slate-400 text-xs mt-1">Use the navigation below to continue.</p>
                </GlassCard>
              ) : !isPaused ? (
                <GlassCard className="p-4 space-y-3">
                  <h3 className="text-white font-semibold text-sm">Log Set #{completedSets + 1}</h3>

                  {/* Inputs row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Weight (lbs)</label>
                      <input
                        ref={weightInputRef}
                        type="number"
                        inputMode="decimal"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:border-purple-500"
                        placeholder="135"
                        step="5"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Reps</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:border-purple-500"
                        placeholder="8"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">RIR</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={rir}
                        onChange={(e) => setRir(e.target.value)}
                        className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:border-purple-500"
                        placeholder="2"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">RIR accepts single number (2) or range (1-2)</p>

                  {/* Feedback tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {FEEDBACK_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                          selectedTags.includes(tag.id)
                            ? `${tag.color} border-current`
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>

                  {/* Note */}
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Quick note... (optional)"
                    maxLength={100}
                  />

                  {/* Log Set button */}
                  <button
                    onClick={handleLogSet}
                    disabled={!weight || !reps || !rir || !isValidRIR(rir)}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                  >
                    <Check className="w-5 h-5" />
                    Log Set #{completedSets + 1}
                  </button>
                </GlassCard>
              ) : (
                <GlassCard className="p-4 text-center">
                  <p className="text-yellow-400 font-semibold">⏸ Paused</p>
                  <p className="text-slate-400 text-sm mt-1">Resume to continue logging sets.</p>
                </GlassCard>
              )}

              {/* Completed sets history */}
              {completedSets > 0 && (
                <GlassCard className="p-4">
                  <h3 className="text-white font-semibold text-sm mb-2">Logged Sets</h3>
                  <div className="space-y-1.5">
                    {currentExercise.completedSets.map((set, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                        <span className="text-slate-400 text-xs">Set {set.setNumber}</span>
                        <div className="flex gap-3 text-white text-xs font-medium">
                          <span>{set.weight} lbs</span>
                          <span>{set.reps} reps</span>
                          <span className="text-purple-400">{set.rir} RIR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── FIXED BOTTOM NAVIGATION ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-white/10 safe-area-bottom">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Exercise dots indicator */}
          <div className="flex justify-center gap-1.5 mb-2">
            {session.exercises.map((_, idx) => {
              const done = session.exercises[idx].completedSets.length >= (session.exercises[idx].targetSets || 1);
              return (
                <div
                  key={idx}
                  className={`rounded-full transition-all ${
                    idx === session.currentExerciseIndex
                      ? 'w-4 h-2 bg-purple-500'
                      : done
                        ? 'w-2 h-2 bg-green-500/70'
                        : 'w-2 h-2 bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToPreviousExercise}
              disabled={session.currentExerciseIndex === 0}
              className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-white text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {allSetsDone ? (
              isLastExercise ? (
                <button
                  onClick={handleEndWorkout}
                  className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition text-white font-bold text-sm"
                >
                  🏁 Finish Workout
                </button>
              ) : (
                <button
                  onClick={goToNextExercise}
                  className="flex-[2] py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition text-white font-bold text-sm flex items-center justify-center gap-1"
                >
                  Next Exercise <ChevronRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <div className="flex-[2] py-3 bg-white/5 rounded-xl text-center text-slate-500 text-xs flex items-center justify-center">
                Complete sets first
              </div>
            )}

            <button
              onClick={() => {
                if (session.currentExerciseIndex < session.exercises.length - 1)
                  goToNextExercise();
              }}
              disabled={isLastExercise}
              className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-white text-sm font-medium"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── EXIT CONFIRMATION ─── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6">
            <h3 className="text-white font-bold mb-2">Exit Workout?</h3>
            <p className="text-slate-400 text-sm mb-5">Your progress is auto-saved. You can return later.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition text-white text-sm"
              >Cancel</button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition text-red-400 text-sm"
              >Exit</button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ─── WORKOUT SUMMARY ─── */}
      {showSummary && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AuraBackground />
          <WorkoutSummary
            session={session}
            prsAchieved={sessionPRs}
            onComplete={handleSummaryComplete}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
}

