'use client';

/**
 * Cycle Warning Component
 *
 * Displays a warning when user has logged 30+ workouts.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getWorkoutCount } from '@/lib/utils/export';
import GlassCard from '@/components/aura/GlassCard';
import {
  AlertTriangle,
  Download,
  X,
  ArrowRight,
} from 'lucide-react';

const DISMISS_KEY = 'cycle-warning-dismissed';
const THRESHOLD = 30;

export default function CycleWarning() {
  const router = useRouter();

  const [workoutCount, setWorkoutCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const checkWorkoutCount = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const count = await getWorkoutCount(user.id);
        setWorkoutCount(count);

        // Check if dismissed
        const dismissed = localStorage.getItem(DISMISS_KEY);
        const dismissedUntil = dismissed ? parseInt(dismissed, 10) : 0;
        const isStillDismissed = dismissedUntil > Date.now();

        setIsDismissed(isStillDismissed);
      } catch (error) {
        console.error('Failed to check workout count:', error);
      }
    };

    checkWorkoutCount();
  }, []);

  const handleDismiss = () => {
    // Dismiss for 7 days
    const dismissUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem(DISMISS_KEY, dismissUntil.toString());
    setIsDismissed(true);
    setShowWarning(false);
  };

  const handleGoToExport = () => {
    router.push('/history');
    setShowWarning(false);
  };

  if (workoutCount < THRESHOLD || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Badge / Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <button
          onClick={() => setShowWarning(true)}
          className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-between hover:from-yellow-500/30 hover:to-amber-500/30 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">
                {workoutCount} Workouts Logged!
              </p>
              <p className="text-slate-400 text-sm">
                Consider exporting and starting a new cycle
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-yellow-400" />
        </button>
      </motion.div>

      {/* Full Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <GlassCard className="max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Time to Export!</h2>
                  </div>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="p-2 text-slate-400 hover:text-white transition"
                    aria-label="Close warning dialog"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-white">{workoutCount}</p>
                    <p className="text-slate-400">workouts logged</p>
                  </div>

                  <p className="text-slate-300 text-center">
                    You've been crushing it! 💪 For optimal performance, we recommend
                    exporting your data and starting a fresh training cycle.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleGoToExport}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-amber-400 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Go to Export
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 bg-white/10 text-slate-300 rounded-xl hover:bg-white/20 transition"
                  >
                    Remind me later
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

