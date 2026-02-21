'use client';

/**
 * Export Button Component
 *
 * Provides workout data export and archive functionality.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { exportWorkoutsToCSV, archiveAndClearWorkouts } from '@/lib/utils/export';
import GlassCard from '@/components/aura/GlassCard';
import {
  Download,
  Archive,
  Trash2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface ExportButtonProps {
  workoutCount: number;
}

export default function ExportButton({ workoutCount }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const result = await exportWorkoutsToCSV(user.id);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Exported ${result.workoutCount} workouts successfully!`,
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsExporting(false);
    }
  };

  const handleArchiveAndClear = async () => {
    if (!confirm('Are you sure? This will delete all workouts after archiving PRs.')) {
      return;
    }

    setIsArchiving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First export
      await exportWorkoutsToCSV(user.id);

      // Then archive and clear
      const result = await archiveAndClearWorkouts(user.id, true);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Workouts archived and cleared. PRs preserved!',
        });
        // Refresh the page after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Archive failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Archive failed';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center gap-2 text-white"
        aria-label="Export data"
      >
        <Download className="w-5 h-5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
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
                  <h2 className="text-xl font-bold text-white">Export Data</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Workout Count Info */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-3xl font-bold text-white">{workoutCount}</p>
                  <p className="text-slate-400">workouts logged</p>

                  {workoutCount >= 30 && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-yellow-400 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Consider exporting and starting fresh!</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                {message && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {message.type === 'success' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* Export Only */}
                  <button
                    onClick={handleExport}
                    disabled={isExporting || isArchiving || workoutCount === 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download CSV
                      </>
                    )}
                  </button>

                  {/* Export & Archive */}
                  <button
                    onClick={handleArchiveAndClear}
                    disabled={isExporting || isArchiving || workoutCount === 0}
                    className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isArchiving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="w-5 h-5" />
                        Export & Clear for New Cycle
                      </>
                    )}
                  </button>

                  {/* Info */}
                  <p className="text-xs text-slate-500 text-center mt-4">
                    "Export & Clear" will download your data, archive your PRs, then clear your workout history to start fresh.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

