'use client';

/**
 * Volume Chart Component
 *
 * Displays weekly volume trends as a simple bar chart.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getWeeklyVolumeTrends, VolumeByWeek } from '@/lib/utils/analytics';
import GlassCard from '@/components/aura/GlassCard';
import { BarChart3 } from 'lucide-react';

export default function VolumeChart() {
  const [volumeData, setVolumeData] = useState<VolumeByWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVolumeData = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = await getWeeklyVolumeTrends(user.id, 4);
        setVolumeData(data);
      } catch (error) {
        console.error('Failed to fetch volume data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolumeData();
  }, []);

  if (isLoading) {
    return (
      <GlassCard>
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />
          <div className="h-40 bg-white/5 rounded" />
        </div>
      </GlassCard>
    );
  }

  // Calculate max volume for scaling
  const maxVolume = Math.max(...volumeData.map(d => d.totalVolume), 1);

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Weekly Volume</h3>
      </div>

      {volumeData.length === 0 || maxVolume === 0 ? (
        <p className="text-slate-400 text-center py-6">
          No volume data yet. Start logging workouts!
        </p>
      ) : (
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {volumeData.map((week, index) => {
              const height = (week.totalVolume / maxVolume) * 100;
              const weekLabel = new Date(week.weekStart).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={week.weekStart} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg relative group"
                    style={{ minHeight: week.totalVolume > 0 ? '8px' : '0' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                      {week.totalVolume.toLocaleString()} kg
                      <br />
                      {week.totalSets} sets
                    </div>
                  </motion.div>
                  <p className="text-xs text-slate-500 mt-2 text-center">{weekLabel}</p>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex justify-between text-sm text-slate-400 pt-2 border-t border-white/10">
            <span>
              Total: {volumeData.reduce((sum, w) => sum + w.totalVolume, 0).toLocaleString()} kg
            </span>
            <span>
              {volumeData.reduce((sum, w) => sum + w.workoutCount, 0)} workouts
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

