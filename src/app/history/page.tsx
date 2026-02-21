'use client';

/**
 * Workout History Page
 *
 * Displays workout history with calendar view, filtering, and export options.
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuraBackground from '@/components/aura/AuraBackground';
import GlassCard from '@/components/aura/GlassCard';
import WorkoutCalendar from '@/components/history/WorkoutCalendar';
import WorkoutDetail from '@/components/history/WorkoutDetail';
import ExportButton from '@/components/history/ExportButton';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Filter,
  Search,
  X,
  ChevronLeft,
  Dumbbell,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface WorkoutSummary {
  id: string;
  date: string;
  workoutType: string;
  durationMinutes: number | null;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
}

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

const WORKOUT_TYPES = [
  'All',
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Chest Day',
  'Back Day',
  'Arm Day',
  'Shoulder Day',
];

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('workouts')
          .select(`
            id,
            date,
            workout_type,
            duration_minutes,
            exercises (
              id,
              sets (
                weight,
                reps
              )
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (fetchError) throw fetchError;

        // Process workouts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedWorkouts: WorkoutSummary[] = (data || []).map((w: any) => {
          let setCount = 0;
          let totalVolume = 0;

          (w.exercises || []).forEach((ex: { sets: Array<{ weight: number; reps: number }> }) => {
            (ex.sets || []).forEach((set: { weight: number; reps: number }) => {
              setCount++;
              totalVolume += (set.weight || 0) * (set.reps || 0);
            });
          });

          return {
            id: w.id,
            date: w.date,
            workoutType: w.workout_type,
            durationMinutes: w.duration_minutes,
            exerciseCount: (w.exercises || []).length,
            setCount,
            totalVolume: Math.round(totalVolume),
          };
        });

        setWorkouts(processedWorkouts);
      } catch (err) {
        console.error('Failed to fetch workouts:', err);
        setError('Failed to load workout history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [supabase, router]);

  // Fetch workout detail
  const fetchWorkoutDetail = async (workoutId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('workouts')
        .select(`
          id,
          date,
          workout_type,
          duration_minutes,
          user_overall_feedback,
          exercises (
            id,
            name,
            order_index,
            sets (
              set_number,
              weight,
              reps,
              rir,
              user_set_feedback,
              is_pr
            )
          )
        `)
        .eq('id', workoutId)
        .single();

      if (fetchError) throw fetchError;

      // Process data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detail: WorkoutDetailData = {
        id: data.id,
        date: data.date,
        workoutType: data.workout_type,
        durationMinutes: data.duration_minutes,
        userFeedback: data.user_overall_feedback,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exercises: (data.exercises || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sets: (ex.sets || [])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .sort((a: any, b: any) => (a.set_number || 0) - (b.set_number || 0))
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((set: any) => ({
                setNumber: set.set_number,
                weight: set.weight,
                reps: set.reps,
                rir: set.rir,
                feedback: set.user_set_feedback,
                isPR: set.is_pr || false,
              })),
          })),
      };

      setSelectedWorkout(detail);
    } catch (err) {
      console.error('Failed to fetch workout detail:', err);
    }
  };

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      // Type filter
      if (selectedType !== 'All' && w.workoutType !== selectedType) {
        return false;
      }

      // Search filter (searches workout type)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return w.workoutType.toLowerCase().includes(query);
      }

      return true;
    });
  }, [workouts, selectedType, searchQuery]);

  // Group workouts by date for calendar
  const workoutsByDate = useMemo(() => {
    const byDate: Record<string, WorkoutSummary[]> = {};
    filteredWorkouts.forEach(w => {
      if (!byDate[w.date]) {
        byDate[w.date] = [];
      }
      byDate[w.date].push(w);
    });
    return byDate;
  }, [filteredWorkouts]);

  if (isLoading) {
    return (
      <>
        <AuraBackground />
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
              />
              <p className="text-white">Loading history...</p>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  return (
    <>
      <AuraBackground />
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                aria-label="Back to dashboard"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Workout History</h1>
                <p className="text-slate-400 text-sm">{workouts.length} workouts logged</p>
              </div>
            </div>

            <div className="flex gap-2">
              <ExportButton workoutCount={workouts.length} />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg transition ${
                  showFilters ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label="Toggle filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <GlassCard>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workouts..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                      {WORKOUT_TYPES.slice(0, 5).map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-2 rounded-lg text-sm transition ${
                            selectedType === type
                              ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar & List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Calendar View */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Calendar</h2>
                </div>
                <WorkoutCalendar
                  workoutsByDate={workoutsByDate}
                  onSelectDate={(date) => {
                    const workout = workoutsByDate[date]?.[0];
                    if (workout) {
                      fetchWorkoutDetail(workout.id);
                    }
                  }}
                />
              </GlassCard>

              {/* Workout List */}
              <GlassCard>
                <h2 className="text-lg font-semibold text-white mb-4">Recent Workouts</h2>
                {filteredWorkouts.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No workouts found</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredWorkouts.slice(0, 20).map(workout => (
                      <button
                        key={workout.id}
                        onClick={() => fetchWorkoutDetail(workout.id)}
                        className={`w-full p-4 rounded-lg text-left transition ${
                          selectedWorkout?.id === workout.id
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{workout.workoutType}</p>
                            <p className="text-slate-400 text-sm">
                              {new Date(workout.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Dumbbell className="w-4 h-4" />
                              <span>{workout.exerciseCount} exercises</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <TrendingUp className="w-4 h-4" />
                              <span>{workout.totalVolume.toLocaleString()} kg</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Workout Detail */}
            <div className="lg:col-span-1">
              <WorkoutDetail
                workout={selectedWorkout}
                onClose={() => setSelectedWorkout(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

