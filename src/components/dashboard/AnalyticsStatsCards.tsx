'use client';

/**
 * Analytics Stats Cards Component
 *
 * Displays workout statistics in a grid of cards.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getWorkoutStats, WorkoutStats } from '@/lib/utils/analytics';
import {
  Activity,
  Calendar,
  Flame,
  Clock,
  TrendingUp,
  Target,
} from 'lucide-react';

export default function AnalyticsStatsCards() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const workoutStats = await getWorkoutStats(user.id);
        setStats(workoutStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-xl p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: Activity,
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Calendar,
      label: 'This Month',
      value: stats.totalWorkoutsThisMonth,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      icon: Target,
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: Clock,
      label: 'Avg Duration',
      value: `${stats.averageWorkoutDuration} min`,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Avg Per Week',
      value: stats.averageWorkoutsPerWeek,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
        >
          <div className={`inline-flex p-2 ${card.bgColor} rounded-lg mb-2`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          <p className="text-xs text-slate-500">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

