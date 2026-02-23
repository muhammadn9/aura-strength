/**
 * AI Session Generator Component — Redesigned Pre-Workout Flow (#50)
 *
 * Step 1: Pick workout type (presets + custom free-text)
 * Step 2: Time (free-text input) + Energy slider
 * Step 3: Optional coach notes (pre-workout chat)
 * Step 4: AI generates plan → Review/Confirm/Curate screen
 * Step 5: User confirms → Start Workout
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, ArrowRight, Clock, Battery, MessageSquare, Edit3, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutTypeSelector, type WorkoutType } from './WorkoutTypeSelector';
import { cn } from '@/lib/utils';
import type { AIWorkoutResponse } from '@/lib/ai/types';
import { useWorkoutSession } from '@/components/workout/WorkoutSessionProvider';
import type { SessionExercise } from '@/types/session';

type GenerationState = 'idle' | 'generating' | 'review' | 'error';

export function AISessionGenerator() {
  const [state, setState] = useState<GenerationState>('idle');
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [customType, setCustomType] = useState('');
  const [useCustomType, setUseCustomType] = useState(false);
  const [timeAvailable, setTimeAvailable] = useState('60');
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [coachNotes, setCoachNotes] = useState('');
  const [showCoachNotes, setShowCoachNotes] = useState(false);
  const [workout, setWorkout] = useState<AIWorkoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [modificationRequest, setModificationRequest] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const { startSession } = useWorkoutSession();

  const effectiveWorkoutType = useCustomType ? customType.trim() : selectedType;

  const getEnergyEmoji = (level: number) => {
    if (level <= 3) return '😴';
    if (level <= 5) return '😐';
    if (level <= 7) return '💪';
    return '🔥';
  };

  const handleGenerate = async (modRequest?: string) => {
    if (!effectiveWorkoutType) return;
    const timeNum = parseInt(timeAvailable);
    if (!timeNum || timeNum < 15 || timeNum > 180) return;

    setState('generating');
    setError(null);
    if (modRequest) setIsModifying(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          workoutType: effectiveWorkoutType,
          timeAvailable: timeNum,
          energyLevel,
          coachNotes: modRequest
            ? `${coachNotes ? coachNotes + '\n' : ''}Modification request: ${modRequest}`
            : coachNotes || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to generate workout');

      setGenerationTime(Date.now() - startTime);
      setWorkout(data.data);
      setState('review');
      setModificationRequest('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    } finally {
      setIsModifying(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!workout || !effectiveWorkoutType) return;
    const sessionExercises: SessionExercise[] = workout.exercises.map((ex, idx) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      muscleGroups: ex.muscleGroups,
      targetSets: ex.sets,
      targetReps: ex.targetReps,
      targetRIR: ex.targetRIR,
      restSeconds: ex.restSeconds,
      coachNote: ex.coachNote,
      completedSets: [],
      order: idx,
    }));
    try {
      setError(null);
      await startSession(effectiveWorkoutType, sessionExercises);
    } catch (err) {
      console.error('Failed to start workout session', err);
      setError('Failed to start workout. Please try again.');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setWorkout(null);
    setError(null);
    setModificationRequest('');
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">AI Coach</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {state === 'review' ? 'Your Workout Plan' : 'Plan Your Workout'}
          </h1>
        </div>

        <AnimatePresence mode="wait">

          {/* ── IDLE: Setup Form ── */}
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Workout Type */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <h2 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                  What are you training today?
                </h2>

                {/* Custom type toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setUseCustomType(false)}
                    className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                      !useCustomType ? 'bg-purple-500/20 border border-purple-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10')}
                  >
                    Choose a split
                  </button>
                  <button
                    onClick={() => setUseCustomType(true)}
                    className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                      useCustomType ? 'bg-purple-500/20 border border-purple-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10')}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Custom / Write own
                  </button>
                </div>

                {useCustomType ? (
                  <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    placeholder='e.g. "Back and Biceps", "Chest superset day", "Active recovery"'
                    maxLength={60}
                    autoFocus
                  />
                ) : (
                  <WorkoutTypeSelector onSelect={setSelectedType} selected={selectedType} disabled={false} />
                )}
              </div>

              {/* Time + Energy */}
              {(selectedType || (useCustomType && customType.trim())) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                  {/* Time */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                      <Clock className="w-4 h-4 text-purple-400" />
                      How much time do you have?
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={timeAvailable}
                        onChange={(e) => setTimeAvailable(e.target.value)}
                        min={15}
                        max={180}
                        className="w-24 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500"
                        placeholder="60"
                      />
                      <span className="text-slate-400 text-sm">minutes</span>
                      <div className="flex gap-2 ml-auto">
                        {[30, 45, 60, 90].map(t => (
                          <button key={t} onClick={() => setTimeAvailable(String(t))}
                            className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                              timeAvailable === String(t)
                                ? 'bg-purple-500/20 border border-purple-500 text-white'
                                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10')}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                    {parseInt(timeAvailable) < 15 || parseInt(timeAvailable) > 180 ? (
                      <p className="text-xs text-red-400 mt-2">Please enter between 15–180 minutes</p>
                    ) : null}
                  </div>

                  {/* Energy */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                      <Battery className="w-4 h-4 text-purple-400" />
                      Energy level: {energyLevel}/10 {getEnergyEmoji(energyLevel)}
                    </label>
                    <input
                      type="range" min="1" max="10" value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      aria-label="Energy level"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>😴 Exhausted</span><span>💪 Good</span><span>🔥 Fired Up</span>
                    </div>
                  </div>

                  {/* Coach Notes (optional toggle) */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowCoachNotes(!showCoachNotes)}
                      className="w-full px-4 py-3 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-500/50 text-white text-xs flex items-center justify-center font-bold">4</span>
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">Tell your coach something</span>
                      <span className="text-xs text-slate-500 ml-1">(optional)</span>
                      {showCoachNotes ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </button>
                    <AnimatePresence>
                      {showCoachNotes && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4">
                            <textarea
                              value={coachNotes}
                              onChange={(e) => setCoachNotes(e.target.value)}
                              className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 resize-none"
                              placeholder={"Focus on upper chest today\nRight shoulder is tight, avoid overhead pressing\nWant supersets to save time\nTraining for strength this cycle"}
                              rows={4}
                              maxLength={500}
                            />
                            <p className="text-xs text-slate-500 mt-1">{coachNotes.length}/500</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={!effectiveWorkoutType || !timeAvailable || parseInt(timeAvailable) < 15 || parseInt(timeAvailable) > 180}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold text-lg transition-all',
                      'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30',
                      'hover:from-purple-600 hover:to-indigo-600 hover:shadow-purple-500/50',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      'flex items-center justify-center gap-2'
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate My Workout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── GENERATING ── */}
          {state === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {isModifying ? 'Updating Your Plan...' : 'Generating Your Workout...'}
                </h3>
                <p className="text-sm text-slate-400">Analyzing your history and crafting the perfect session</p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2.5 h-2.5 rounded-full bg-purple-500"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── REVIEW: Confirm/Curate Workout ── */}
          {state === 'review' && workout && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Workout header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white">{workout.workoutType}</h2>
                    <p className="text-sm text-slate-300 mt-1">{workout.summary}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      <span><span className="text-purple-400 font-semibold">{workout.exercises.length}</span> exercises</span>
                      {workout.estimatedDuration && (
                        <span><span className="text-purple-400 font-semibold">{workout.estimatedDuration}</span> min</span>
                      )}
                      <span>Generated in <span className="text-purple-400 font-semibold">{(generationTime / 1000).toFixed(1)}s</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercise list */}
              <div className="space-y-2">
                {workout.exercises.map((ex, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm">{ex.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ex.muscleGroups.join(', ')}</p>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400 flex-shrink-0 text-right">
                        <div><span className="text-white font-bold">{ex.sets}</span> sets</div>
                        <div><span className="text-white font-bold">{ex.targetReps}</span> reps</div>
                        <div>RIR <span className="text-white font-bold">{ex.targetRIR}</span></div>
                        <div><span className="text-white font-bold">{ex.restSeconds}s</span> rest</div>
                      </div>
                    </div>
                    {ex.coachNote && (
                      <p className="text-xs text-indigo-300 mt-2 pl-0">
                        <span className="font-semibold">Coach: </span>{ex.coachNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Modification / Curate input */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-slate-300 font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Request a change (optional)
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modificationRequest}
                    onChange={(e) => setModificationRequest(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    placeholder='"Swap bench for dumbbell press", "Add a bicep curl", "Remove warm-up sets"'
                    onKeyDown={(e) => { if (e.key === 'Enter' && modificationRequest.trim()) handleGenerate(modificationRequest); }}
                  />
                  <button
                    onClick={() => handleGenerate(modificationRequest)}
                    disabled={!modificationRequest.trim()}
                    className="px-3 py-2.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Submit modification"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
                <button onClick={handleStartWorkout}
                  className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Let&apos;s Go — Start Workout
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-xl font-bold text-white">Generation Failed</h3>
                <p className="text-sm text-slate-400">{error || 'Something went wrong'}</p>
              </div>
              <button onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition text-sm"
              >Try Again</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

