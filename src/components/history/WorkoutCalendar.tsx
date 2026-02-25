'use client';

/**
 * Workout Calendar Component
 *
 * Displays a monthly calendar with workout indicators.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkoutSummary {
  id: string;
  date: string;
  workoutType: string;
  durationMinutes: number | null;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
}

interface WorkoutCalendarProps {
  workoutsByDate: Record<string, WorkoutSummary[]>;
  onSelectDate: (date: string) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WorkoutCalendar({ workoutsByDate, onSelectDate }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Create calendar grid
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Add previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Add current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const now = new Date();
    // Don't navigate past the current month
    if (nextMonth.getFullYear() < now.getFullYear() ||
      (nextMonth.getFullYear() === now.getFullYear() && nextMonth.getMonth() <= now.getMonth())) {
      setCurrentDate(nextMonth);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          // Use local date string instead of UTC to avoid timezone issues
          const year = day.date.getFullYear();
          const month = String(day.date.getMonth() + 1).padStart(2, '0');
          const date = String(day.date.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${date}`;
          const hasWorkout = workoutsByDate[dateStr] && workoutsByDate[dateStr].length > 0;
          const isToday = day.date.getTime() === today.getTime();

          return (
            <motion.button
              key={index}
              onClick={() => hasWorkout && onSelectDate(dateStr)}
              disabled={!hasWorkout}
              whileHover={hasWorkout ? { scale: 1.1 } : undefined}
              whileTap={hasWorkout ? { scale: 0.95 } : undefined}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm transition
                ${!day.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                ${isToday ? 'ring-2 ring-purple-500' : ''}
                ${hasWorkout 
                  ? 'bg-purple-500/30 text-purple-300 cursor-pointer hover:bg-purple-500/50' 
                  : 'hover:bg-white/5 cursor-default'}
              `}
            >
              {day.date.getDate()}

              {/* Workout indicator dot */}
              {hasWorkout && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-purple-500/30 rounded" />
          <span>Workout day</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 ring-2 ring-purple-500 rounded" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

