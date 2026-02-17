'use client'

/**
 * Workout Session Provider
 *
 * Manages active workout session state and auto-save
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WorkoutSession, SessionExercise, SessionSet } from '@/types/session';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;

  // Session management
  startSession: (workoutType: string, exercises: SessionExercise[]) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (overallFeedback?: string) => Promise<void>;

  // Exercise navigation
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  setCurrentExercise: (index: number) => void;

  // Set logging
  logSet: (exerciseIndex: number, setData: Partial<SessionSet>) => Promise<void>;
  getCurrentExercise: () => SessionExercise | null;
  getCurrentSet: () => SessionSet | null;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Auto-save session to localStorage on every change
  useEffect(() => {
    if (session) {
      localStorage.setItem('activeWorkoutSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('activeWorkoutSession');
    }
  }, [session]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('activeWorkoutSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Convert date strings back to Date objects
        parsed.startTime = new Date(parsed.startTime);
        parsed.exercises.forEach((ex: SessionExercise) => {
          ex.completedSets.forEach((set: SessionSet) => {
            set.timestamp = new Date(set.timestamp);
          });
        });
        setSession(parsed);
      } catch (err) {
        console.error('Failed to load saved session:', err);
        localStorage.removeItem('activeWorkoutSession');
      }
    }
  }, []);

  const startSession = useCallback(async (workoutType: string, exercises: SessionExercise[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newSession: WorkoutSession = {
        id: crypto.randomUUID(),
        userId: user.id,
        workoutType,
        startTime: new Date(),
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        status: 'active',
        exercises: exercises.map((ex, idx) => ({
          ...ex,
          completedSets: [],
          order: idx,
        })),
      };

      setSession(newSession);
      router.push(`/workout/session/${newSession.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  const pauseSession = useCallback(() => {
    setSession(prev => prev ? { ...prev, status: 'paused' } : null);
  }, []);

  const resumeSession = useCallback(() => {
    setSession(prev => prev ? { ...prev, status: 'active' } : null);
  }, []);

  const endSession = useCallback(async (overallFeedback?: string) => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60); // minutes

      // Insert workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: session.startTime.toISOString(),
          workout_type: session.workoutType,
          duration,
          user_overall_feedback: overallFeedback || null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert exercises and sets
      for (const exercise of session.exercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: exercise.name,
            order_index: exercise.order,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Insert sets
        if (exercise.completedSets.length > 0) {
          const setsToInsert = exercise.completedSets
            .filter(set => set.completed)
            .map(set => ({
              exercise_id: exerciseData.id,
              weight: set.weight,
              reps: set.reps,
              rir: set.rir,
              user_set_feedback: set.feedback || null,
              is_pr: false, // TODO: Calculate PR in future PR
            }));

          if (setsToInsert.length > 0) {
            const { error: setsError } = await supabase
              .from('sets')
              .insert(setsToInsert);

            if (setsError) throw setsError;
          }
        }
      }

      // Clear session
      setSession(null);
      localStorage.removeItem('activeWorkoutSession');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workout';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase, router]);

  const goToNextExercise = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.currentExerciseIndex >= prev.exercises.length - 1) return prev;
      return {
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
        currentSetIndex: 0,
      };
    });
  }, []);

  const goToPreviousExercise = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.currentExerciseIndex === 0) return prev;
      return {
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex - 1,
        currentSetIndex: 0,
      };
    });
  }, []);

  const setCurrentExercise = useCallback((index: number) => {
    setSession(prev => {
      if (!prev || index < 0 || index >= prev.exercises.length) return prev;
      return {
        ...prev,
        currentExerciseIndex: index,
        currentSetIndex: 0,
      };
    });
  }, []);

  const logSet = useCallback(async (exerciseIndex: number, setData: Partial<SessionSet>) => {
    setSession(prev => {
      if (!prev) return prev;

      const updatedExercises = [...prev.exercises];
      const exercise = updatedExercises[exerciseIndex];

      if (!exercise) return prev;

      // Find or create the current set
      const currentSetNumber = exercise.completedSets.length + 1;
      const newSet: SessionSet = {
        setNumber: currentSetNumber,
        weight: setData.weight ?? null,
        reps: setData.reps ?? null,
        rir: setData.rir ?? null,
        completed: setData.completed ?? true,
        timestamp: new Date(),
        feedback: setData.feedback,
      };

      exercise.completedSets.push(newSet);

      return {
        ...prev,
        exercises: updatedExercises,
        currentSetIndex: exercise.completedSets.length,
      };
    });
  }, []);

  const getCurrentExercise = useCallback(() => {
    if (!session) return null;
    return session.exercises[session.currentExerciseIndex] || null;
  }, [session]);

  const getCurrentSet = useCallback(() => {
    const exercise = getCurrentExercise();
    if (!exercise) return null;
    return exercise.completedSets[session!.currentSetIndex] || null;
  }, [session, getCurrentExercise]);

  const value: WorkoutSessionContextType = {
    session,
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    goToNextExercise,
    goToPreviousExercise,
    setCurrentExercise,
    logSet,
    getCurrentExercise,
    getCurrentSet,
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
}

