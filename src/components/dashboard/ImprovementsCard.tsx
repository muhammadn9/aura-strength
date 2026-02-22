'use client';

/**
 * Improvements Card Component
 *
 * Displays top exercise improvements.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getExerciseImprovements, ExerciseImprovement } from '@/lib/utils/analytics';
import GlassCard from '@/components/aura/GlassCard';
import {
  TrendingUp,
  Award,
} from 'lucide-react';

export default function ImprovementsCard() {
  const [improvements, setImprovements] = useState<ExerciseImprovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchImprovements = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = await getExerciseImprovements(user.id, 5);
        setImprovements(data);
      } catch (error) {
        console.error('Failed to fetch improvements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImprovements();
  }, [supabase]);

  if (isLoading) {
    return (
      <GlassCard>
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Top Improvements</h3>
      </div>

      {improvements.length === 0 ? (
        <p className="text-slate-400 text-center py-6">
          Keep training to see your improvements!
        </p>
      ) : (
        <div className="space-y-3">
          {improvements.map((improvement, index) => (
            <motion.div
              key={improvement.exerciseName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {index === 0 && (
                  <Award className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="text-white font-medium">{improvement.exerciseName}</p>
                  <p className="text-xs text-slate-500">
                    {improvement.firstWeight} lbs → {improvement.currentWeight} lbs
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-bold">
                  +{improvement.improvementPercent}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

