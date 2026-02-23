/**
 * Equipment Selector Component (#51)
 *
 * Grouped checkboxes by muscle group.
 * Presets: Full Gym, Home Gym, Bodyweight Only.
 * Select All / Deselect All per group.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface EquipmentByGroup {
  chest: string[];
  back: string[];
  shoulders: string[];
  arms: string[];
  legs: string[];
  core: string[];
}

export const EQUIPMENT_OPTIONS: Record<keyof EquipmentByGroup, { id: string; label: string }[]> = {
  chest: [
    { id: 'barbell_flat_bench', label: 'Barbell + Flat Bench' },
    { id: 'dumbbells_flat_bench', label: 'Dumbbells + Flat Bench' },
    { id: 'incline_bench', label: 'Incline Bench' },
    { id: 'decline_bench', label: 'Decline Bench' },
    { id: 'cable_crossover', label: 'Cable Crossover Machine' },
    { id: 'chest_press_machine', label: 'Chest Press Machine' },
    { id: 'pec_deck', label: 'Pec Deck / Fly Machine' },
    { id: 'dip_station', label: 'Dip Station' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
  ],
  back: [
    { id: 'pullup_bar', label: 'Pull-Up Bar' },
    { id: 'lat_pulldown', label: 'Lat Pulldown Machine' },
    { id: 'cable_row', label: 'Cable Row Machine' },
    { id: 'barbell_rows', label: 'Barbell (rows/deadlifts)' },
    { id: 'dumbbells_back', label: 'Dumbbells' },
    { id: 'tbar_row', label: 'T-Bar Row' },
    { id: 'seated_row', label: 'Seated Row Machine' },
    { id: 'bands_back', label: 'Resistance Bands' },
  ],
  shoulders: [
    { id: 'dumbbells_shoulders', label: 'Dumbbells' },
    { id: 'barbell_shoulders', label: 'Barbell' },
    { id: 'ohp_machine', label: 'Overhead Press Machine' },
    { id: 'cable_shoulders', label: 'Cable Machine' },
    { id: 'lateral_raise_machine', label: 'Lateral Raise Machine' },
    { id: 'bands_shoulders', label: 'Resistance Bands' },
  ],
  arms: [
    { id: 'dumbbells_arms', label: 'Dumbbells' },
    { id: 'barbell_ez_curl', label: 'Barbell / EZ Curl Bar' },
    { id: 'cable_arms', label: 'Cable Machine' },
    { id: 'preacher_bench', label: 'Preacher Curl Bench' },
    { id: 'tricep_dip', label: 'Tricep Dip Station' },
    { id: 'bands_arms', label: 'Resistance Bands' },
  ],
  legs: [
    { id: 'squat_rack', label: 'Barbell + Squat Rack' },
    { id: 'leg_press', label: 'Leg Press Machine' },
    { id: 'leg_extension', label: 'Leg Extension Machine' },
    { id: 'leg_curl', label: 'Leg Curl Machine' },
    { id: 'hip_thrust', label: 'Hip Thrust Setup' },
    { id: 'calf_raise', label: 'Calf Raise Machine' },
    { id: 'smith_machine', label: 'Smith Machine' },
    { id: 'dumbbells_legs', label: 'Dumbbells' },
    { id: 'bands_legs', label: 'Resistance Bands' },
  ],
  core: [
    { id: 'ab_machine', label: 'Ab Machine' },
    { id: 'cable_core', label: 'Cable Machine' },
    { id: 'decline_bench_core', label: 'Decline Bench' },
    { id: 'stability_ball', label: 'Stability Ball' },
    { id: 'bodyweight_core', label: 'Bodyweight Only' },
  ],
};

const GROUP_LABELS: Record<keyof EquipmentByGroup, string> = {
  chest: '🏋️ Chest',
  back: '🔙 Back',
  shoulders: '💪 Shoulders',
  arms: '💪 Arms (Biceps + Triceps)',
  legs: '🦵 Legs',
  core: '🎯 Core',
};

// Presets
const FULL_GYM: EquipmentByGroup = Object.fromEntries(
  Object.entries(EQUIPMENT_OPTIONS).map(([group, opts]) => [group, opts.map(o => o.id)])
) as unknown as EquipmentByGroup;

const HOME_GYM: EquipmentByGroup = {
  chest: ['dumbbells_flat_bench', 'dip_station', 'resistance_bands'],
  back: ['pullup_bar', 'dumbbells_back', 'bands_back'],
  shoulders: ['dumbbells_shoulders', 'bands_shoulders'],
  arms: ['dumbbells_arms', 'bands_arms'],
  legs: ['dumbbells_legs', 'bands_legs'],
  core: ['bodyweight_core'],
};

const BODYWEIGHT: EquipmentByGroup = {
  chest: ['dip_station'],
  back: ['pullup_bar'],
  shoulders: [],
  arms: ['tricep_dip'],
  legs: [],
  core: ['bodyweight_core'],
};

interface Props {
  value: EquipmentByGroup;
  onChange: (v: EquipmentByGroup) => void;
}

export function EquipmentSelector({ value, onChange }: Props) {
  const [openGroups, setOpenGroups] = useState<Set<keyof EquipmentByGroup>>(new Set(['chest']));

  const toggleGroup = (g: keyof EquipmentByGroup) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) { next.delete(g); } else { next.add(g); }
      return next;
    });
  };

  const toggleItem = (group: keyof EquipmentByGroup, id: string) => {
    const current = value[group] || [];
    onChange({
      ...value,
      [group]: current.includes(id) ? current.filter(x => x !== id) : [...current, id],
    });
  };

  const selectAll = (group: keyof EquipmentByGroup) => {
    onChange({ ...value, [group]: EQUIPMENT_OPTIONS[group].map(o => o.id) });
  };

  const deselectAll = (group: keyof EquipmentByGroup) => {
    onChange({ ...value, [group]: [] });
  };

  const applyPreset = (preset: EquipmentByGroup) => onChange(preset);

  const totalSelected = Object.values(value).flat().length;

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-sm text-slate-400 mb-2">Quick select:</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: '🏟️ Full Gym', preset: FULL_GYM },
            { label: '🏠 Home Gym', preset: HOME_GYM },
            { label: '🤸 Bodyweight', preset: BODYWEIGHT },
          ].map(({ label, preset }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:border-purple-500/50 transition-all"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ chest: [], back: [], shoulders: [], arms: [], legs: [], core: [] })}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-500 hover:bg-white/10 transition-all ml-auto"
          >
            Clear all
          </button>
        </div>
        <p className="text-xs text-purple-400 mt-2">{totalSelected} items selected</p>
      </div>

      {/* Groups */}
      {(Object.keys(EQUIPMENT_OPTIONS) as (keyof EquipmentByGroup)[]).map(group => {
        const opts = EQUIPMENT_OPTIONS[group];
        const selected = value[group] || [];
        const isOpen = openGroups.has(group);
        const allSelected = selected.length === opts.length;

        return (
          <div key={group} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              aria-expanded={isOpen}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{GROUP_LABELS[group]}</span>
                <span className="text-xs text-slate-500">({selected.length}/{opts.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {selected.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3">
                    {/* Select/Deselect all */}
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => selectAll(group)}
                        disabled={allSelected}
                        className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition"
                      >Select all</button>
                      <span className="text-slate-600">·</span>
                      <button type="button" onClick={() => deselectAll(group)}
                        disabled={selected.length === 0}
                        className="text-xs text-slate-400 hover:text-slate-300 disabled:opacity-40 transition"
                      >Deselect all</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {opts.map(opt => {
                        const checked = selected.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggleItem(group, opt.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                              checked
                                ? 'bg-purple-500/20 border border-purple-500/40 text-white'
                                : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-all ${
                              checked ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                            }`}>
                              {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>}
                            </div>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

