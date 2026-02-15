/**
 * AI Session Generator Component
 *
 * Main component for generating AI-powered workout sessions.
 * Handles the complete flow: selection → loading → display.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { WorkoutTypeSelector, type WorkoutType } from './WorkoutTypeSelector';
import { ExerciseCard } from './ExerciseCard';
import { cn } from '@/lib/utils';
import type { AIWorkoutResponse } from '@/lib/ai/types';

type GenerationState = 'idle' | 'generating' | 'success' | 'error';

export function AISessionGenerator() {
  const [state, setState] = useState<GenerationState>('idle');
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [workout, setWorkout] = useState<AIWorkoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);

  const handleSelectType = (type: WorkoutType) => {
    setSelectedType(type);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedType || state === 'generating') return;

    setState('generating');
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workoutType: selectedType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate workout');
      }

      const duration = Date.now() - startTime;
      setGenerationTime(duration);
      setWorkout(data.data);
      setState('success');
    } catch (err) {
      console.error('Error generating workout:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setSelectedType(null);
    setWorkout(null);
    setError(null);
    setGenerationTime(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 md:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <span className="text-xs md:text-sm text-purple-300 font-medium">AI Coach</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent px-4">
            Generate Your Workout
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto px-4">
            Powered by Google Gemini AI. Your personal strength coach that adapts to your
            progress and maximizes every rep.
          </p>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Workout Type Selector */}
              <WorkoutTypeSelector
                onSelect={handleSelectType}
                selected={selectedType}
                disabled={false}
              />

              {/* Generate Button */}
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center px-4"
                >
                  <button
                    onClick={handleGenerate}
                    disabled={state !== 'idle'}
                    className={cn(
                      'group relative w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg',
                      'bg-gradient-to-r from-purple-500 to-indigo-500',
                      'hover:from-purple-600 hover:to-indigo-600',
                      'text-white shadow-lg shadow-purple-500/50',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-300',
                      'hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50'
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="truncate">Generate Workout</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {state === 'generating' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              {/* Animated logo */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              {/* Loading text */}
              <div className="text-center space-y-2 px-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">Generating Your Workout...</h3>
                <p className="text-sm md:text-base text-slate-400">
                  The AI coach is analyzing your history and creating the perfect session
                </p>
              </div>

              {/* Loading dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-3 h-3 rounded-full bg-purple-500"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {state === 'success' && workout && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Success header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 md:p-6 border border-purple-500/20">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 break-words">{workout.workoutType}</h2>
                    <p className="text-sm md:text-base text-slate-300 mb-3 md:mb-4">{workout.summary}</p>
                    <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                      <div className="text-slate-400">
                        <span className="text-purple-400 font-semibold">
                          {workout.exercises.length}
                        </span>{' '}
                        exercises
                      </div>
                      {workout.estimatedDuration && (
                        <div className="text-slate-400">
                          <span className="text-purple-400 font-semibold">
                            {workout.estimatedDuration}
                          </span>{' '}
                          minutes
                        </div>
                      )}
                      <div className="text-slate-400">
                        Generated in{' '}
                        <span className="text-purple-400 font-semibold">
                          {(generationTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                {workout.exercises.map((exercise, index) => (
                  <ExerciseCard key={index} exercise={exercise} index={index} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <button
                  onClick={handleReset}
                  className="px-5 md:px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50 transition-all text-sm md:text-base"
                >
                  Generate Another
                </button>
                <button className="px-5 md:px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all text-sm md:text-base">
                  Start Workout
                </button>
              </div>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              {/* Error icon */}
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>

              {/* Error message */}
              <div className="text-center space-y-2 max-w-md px-4">
                <h3 className="text-xl md:text-2xl font-bold text-white">Generation Failed</h3>
                <p className="text-sm md:text-base text-slate-400 break-words">{error || 'Something went wrong'}</p>
              </div>

              {/* Retry button */}
              <button
                onClick={handleReset}
                className="px-5 md:px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50 transition-all text-sm md:text-base"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

