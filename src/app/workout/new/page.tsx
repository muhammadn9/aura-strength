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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-purple-500/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">AI Workout Generator</h1>
              <p className="text-xs text-slate-400">Powered by Google Gemini</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <AISessionGenerator />
    </div>
  );
}

