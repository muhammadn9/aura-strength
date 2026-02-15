/**
 * Workout Type Selector Component
 *
 * Beautiful glassmorphic selector for choosing workout type.
 * Displays common workout types as interactive buttons.
 */

'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Heart, Zap, Target, Flame, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkoutType =
  | 'Chest Day'
  | 'Back Day'
  | 'Leg Day'
  | 'Shoulder Day'
  | 'Arm Day'
  | 'Push Day'
  | 'Pull Day'
  | 'Upper Body'
  | 'Lower Body'
  | 'Full Body';

interface WorkoutOption {
  type: WorkoutType;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const workoutOptions: WorkoutOption[] = [
  {
    type: 'Chest Day',
    icon: Heart,
    description: 'Chest, triceps, front delts',
    color: 'from-purple-500 to-pink-500',
  },
  {
    type: 'Back Day',
    icon: Activity,
    description: 'Lats, upper back, biceps',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    type: 'Leg Day',
    icon: Zap,
    description: 'Quads, hamstrings, glutes',
    color: 'from-violet-500 to-purple-500',
  },
  {
    type: 'Shoulder Day',
    icon: Target,
    description: 'Delts, traps, rotator cuff',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    type: 'Arm Day',
    icon: Dumbbell,
    description: 'Biceps, triceps, forearms',
    color: 'from-fuchsia-500 to-purple-500',
  },
  {
    type: 'Push Day',
    icon: Flame,
    description: 'Chest, shoulders, triceps',
    color: 'from-pink-500 to-purple-500',
  },
  {
    type: 'Pull Day',
    icon: Activity,
    description: 'Back, rear delts, biceps',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    type: 'Full Body',
    icon: Zap,
    description: 'Complete full-body workout',
    color: 'from-purple-500 to-violet-500',
  },
];

interface WorkoutTypeSelectorProps {
  onSelect: (type: WorkoutType) => void;
  selected?: WorkoutType | null;
  disabled?: boolean;
}

export function WorkoutTypeSelector({
  onSelect,
  selected,
  disabled = false,
}: WorkoutTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          What are you training today?
        </h2>
        <p className="text-slate-400 text-sm">
          Choose your workout type and let the AI coach generate your session
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {workoutOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selected === option.type;

          return (
            <motion.button
              key={option.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !disabled && onSelect(option.type)}
              disabled={disabled}
              className={cn(
                'group relative overflow-hidden rounded-xl p-4',
                'bg-white/5 backdrop-blur-md border border-white/10',
                'hover:bg-white/10 hover:border-purple-500/50',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected && 'bg-white/10 border-purple-500 ring-2 ring-purple-500/50'
              )}
            >
              {/* Background gradient on hover */}
              <div
                className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity',
                  'bg-gradient-to-br',
                  option.color
                )}
              />

              {/* Content */}
              <div className="relative space-y-2">
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    'bg-gradient-to-br',
                    option.color,
                    'group-hover:scale-110 transition-transform'
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div className="text-left">
                  <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {option.type}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{option.description}</p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

