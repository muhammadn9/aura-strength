/**
 * New Workout Page
 *
 * Full-screen page for generating AI-powered workouts.
 * Uses the AISessionGenerator component.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AISessionGenerator } from '@/components/coach/AISessionGenerator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewWorkoutPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-purple-500/50 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
              <span className="text-sm font-medium sm:hidden">Back</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-white truncate">AI Workout Generator</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Powered by Google Gemini</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <AISessionGenerator />
    </div>
  );
}

