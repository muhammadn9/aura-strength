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
import { WorkoutFeedback } from '@/components/workout/WorkoutSummary';

// PR info for tracking across session
export interface SessionPR {
  exerciseName: string;
  weight: number;
  reps: number;
  prType: 'weight' | 'volume' | 'reps';
}

interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  sessionPRs: SessionPR[];

  // Session management
  startSession: (workoutType: string, exercises: SessionExercise[]) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (overallFeedback?: string) => Promise<void>;
  endSessionWithFeedback: (feedback: WorkoutFeedback) => Promise<void>;

  // Exercise navigation
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  setCurrentExercise: (index: number) => void;

  // Set logging
  logSet: (exerciseIndex: number, setData: Partial<SessionSet>) => Promise<void>;
  addPR: (pr: SessionPR) => void;
  getCurrentExercise: () => SessionExercise | null;
  getCurrentSet: () => SessionSet | null;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionPRs, setSessionPRs] = useState<SessionPR[]>([]);
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

      // Insert workout (format date as YYYY-MM-DD for DATE column)
      const formattedDate = session.startTime.toISOString().split('T')[0];

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: formattedDate,
          workout_type: session.workoutType,
          duration_minutes: duration,
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
            .filter(set => set.completed && set.weight !== null && set.reps !== null && set.rir !== null)
            .map((set, idx) => ({
              exercise_id: exerciseData.id,
              set_number: idx + 1,
              weight: set.weight!,
              reps: set.reps!,
              rir: set.rir!,
              user_set_feedback: set.feedback || null,
              is_pr: set.isPR || false,
            }));

          if (setsToInsert.length > 0) {
            const { error: setsError } = await supabase
              .from('sets')
              .insert(setsToInsert);

            if (setsError) throw setsError;
          }
        }
      }

      // Save PRs to all_time_prs table
      if (sessionPRs.length > 0) {
        const prsToInsert = sessionPRs.map(pr => ({
          user_id: user.id,
          exercise_name: pr.exerciseName,
          weight: pr.weight,
          reps: pr.reps,
          date_achieved: formattedDate,
        }));

        const { error: prError } = await supabase
          .from('all_time_prs')
          .insert(prsToInsert);

        if (prError) {
          console.error('Failed to save PRs:', prError);
          // Don't throw - PRs are bonus tracking, don't fail the whole save
        }
      }

      // Clear session and PRs
      setSession(null);
      setSessionPRs([]);
      localStorage.removeItem('activeWorkoutSession');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workout';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionPRs, supabase, router]);

  // Enhanced end session with full feedback
  const endSessionWithFeedback = useCallback(async (feedback: WorkoutFeedback) => {
    // Build the overall feedback string from structured feedback
    const feedbackParts: string[] = [];

    const jointLabels = ['Very Sore', 'Some Pain', 'Okay', 'Good', 'Great'];
    const energyLabels = ['Exhausted', 'Tired', 'Moderate', 'Energized', 'Pumped'];

    feedbackParts.push(`Joint Health: ${jointLabels[feedback.jointHealth - 1]} (${feedback.jointHealth}/5)`);
    if (feedback.jointNotes) {
      feedbackParts.push(`Joint Notes: ${feedback.jointNotes}`);
    }
    feedbackParts.push(`Energy Level: ${energyLabels[feedback.energyLevel - 1]} (${feedback.energyLevel}/5)`);
    if (feedback.overallNotes) {
      feedbackParts.push(`Notes: ${feedback.overallNotes}`);
    }

    await endSession(feedbackParts.join(' | '));
  }, [endSession]);

  // Add a PR to the session tracking
  const addPR = useCallback((pr: SessionPR) => {
    setSessionPRs(prev => [...prev, pr]);
  }, []);

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
        isPR: setData.isPR,
        prType: setData.prType,
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
    if (!session) return null;
    const exercise = getCurrentExercise();
    if (!exercise) return null;
    return exercise.completedSets[session.currentSetIndex] || null;
  }, [session, getCurrentExercise]);

  const value: WorkoutSessionContextType = {
    session,
    isLoading,
    error,
    sessionPRs,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    endSessionWithFeedback,
    goToNextExercise,
    goToPreviousExercise,
    setCurrentExercise,
    logSet,
    addPR,
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

