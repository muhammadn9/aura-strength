'use client';

/**
 * PR Celebration Component
 *
 * Displays an animated celebration when user hits a Personal Record
 * Features:
 * - Confetti animation
 * - Trophy icon with glow effect
 * - PR type indicator (Weight/Volume/Reps)
 * - Improvement stat display
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, X } from 'lucide-react';
import { PRCheckResult, getPRTypeLabel } from '@/lib/utils/pr-detection';

interface PRCelebrationProps {
  prResult: PRCheckResult;
  exerciseName: string;
  weight: number;
  reps: number;
  onClose: () => void;
  autoCloseDelay?: number;
}

// Pre-generate random values for confetti
interface ConfettiData {
  color: string;
  xOffset: number;
  rotation: number;
  duration: number;
  delay: number;
}

// Confetti particle component
const ConfettiParticle = ({ data, x }: { data: ConfettiData; x: number }) => {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: 400,
        x: x + data.xOffset,
        opacity: 0,
        rotate: data.rotation,
        scale: 0.5,
      }}
      transition={{
        duration: data.duration,
        delay: data.delay,
        ease: 'easeOut',
      }}
      className="absolute top-0 w-3 h-3 rounded-sm"
      style={{ backgroundColor: data.color, left: '50%' }}
    />
  );
};

export default function PRCelebration({
  prResult,
  exerciseName,
  weight,
  reps,
  onClose,
  autoCloseDelay = 5000,
}: PRCelebrationProps) {
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; data: ConfettiData; x: number }>>([]);

  // Generate confetti on mount with pre-computed random values
  useEffect(() => {
    const colors = ['#A855F7', '#6366F1', '#22C55E', '#EAB308', '#EC4899'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      data: {
        color: colors[Math.floor(Math.random() * colors.length)],
        xOffset: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720 - 360,
        duration: 2 + Math.random(),
        delay: Math.random() * 0.5,
      },
      x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 800),
    }));
    setConfettiParticles(particles);
  }, []);

  // Play celebration sound
  const playCelebrationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // Play a triumphant ascending tone
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);

        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
    } catch {
      // Ignore audio errors
    }
  }, []);

  useEffect(() => {
    playCelebrationSound();

    // Auto-close after delay
    const timer = setTimeout(onClose, autoCloseDelay);
    return () => clearTimeout(timer);
  }, [onClose, autoCloseDelay, playCelebrationSound]);

  if (!prResult.isPR || !prResult.prType) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiParticles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              data={particle.data}
              x={particle.x}
            />
          ))}
        </div>

        {/* Main celebration card */}
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border border-purple-500/50 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition"
            aria-label="Close celebration"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy with glow */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full">
                <Trophy className="w-12 h-12 text-yellow-900" />
              </div>
              {/* Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-1 -left-1"
              >
                <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* PR Type Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-full text-yellow-400 font-bold text-lg">
              {getPRTypeLabel(prResult.prType)}
            </span>
          </motion.div>

          {/* Exercise name */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white text-center mb-2"
          >
            {exerciseName}
          </motion.h2>

          {/* PR Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6 mb-4"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{weight}<span className="text-lg text-purple-300">kg</span></p>
              <p className="text-sm text-slate-400">Weight</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{reps}</p>
              <p className="text-sm text-slate-400">Reps</p>
            </div>
          </motion.div>

          {/* Improvement message */}
          {prResult.improvement && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-green-400 font-medium"
            >
              {prResult.improvement}
            </motion.p>
          )}

          {/* Previous best comparison */}
          {prResult.previousBest && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-3 bg-white/5 rounded-lg text-center"
            >
              <p className="text-sm text-slate-400">
                Previous best: {prResult.previousBest.weight}kg × {prResult.previousBest.reps} reps
              </p>
            </motion.div>
          )}

          {/* Dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-slate-500 text-sm mt-4"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

