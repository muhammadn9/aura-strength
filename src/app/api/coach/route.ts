/**
 * AI Coach API Route
 *
 * POST /api/coach
 *
 * Generates AI-powered workout sessions using Google Gemini.
 * Fetches user context, builds the prompt, streams the AI response.
 */

import { createClient } from '@/lib/supabase/server';
import { buildAIContext } from '@/lib/ai/context-builder';
import { COACH_SYSTEM_PROMPT, buildContextMessage } from '@/lib/ai/coach-prompt';
import { validateAIResponse } from '@/lib/ai/coach-prompt';
import { checkRateLimit, RATE_LIMIT_MAX } from '@/lib/rate-limit';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// Request/Response Schemas
// ============================================================================

const RequestSchema = z.object({
  workoutType: z.string().min(1, 'Workout type is required').optional(),
  timeAvailable: z.number().int().min(15).max(180).optional().default(60),
  energyLevel: z.number().int().min(1).max(10).optional().default(7),
  coachNotes: z.string().max(500).optional(),
  mode: z.enum(['generate', 'set_note']).optional().default('generate'),
  // set_note mode fields
  exerciseName: z.string().optional(),
  loggedWeight: z.number().optional(),
  loggedReps: z.number().optional(),
  loggedRIR: z.string().optional(),
  targetReps: z.string().optional(),
  targetRIR: z.string().optional(),
  feedback: z.string().optional(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  muscleGroups: z.array(z.string()),
  sets: z.number().int().min(1).max(10),
  targetReps: z.string(),
  targetRIR: z.string(),
  restSeconds: z.number().int().min(0),
  coachNote: z.string(),
});

const WorkoutResponseSchema = z.object({
  workoutType: z.string(),
  exercises: z.array(ExerciseSchema).min(4).max(6),
  summary: z.string(),
  estimatedDuration: z.number().int().optional(),
});


// ============================================================================
// Main API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[API /coach] Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to use the AI coach' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log(`[API /coach] Request received`);

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      console.error('[API /coach] Invalid request:', validation.error);
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: validation.error.issues[0].message,
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { workoutType, timeAvailable, energyLevel, coachNotes, mode,
      exerciseName, loggedWeight, loggedReps, loggedRIR, targetReps, targetRIR, feedback } = validation.data;

    // ── SET NOTE MODE — bypass rate limit (called after every set) ────────────
    if (mode === 'set_note') {
      if (!exerciseName || loggedWeight === undefined || loggedReps === undefined) {
        return NextResponse.json({ note: '' });
      }
      try {
        const { generateText } = await import('ai');
        const prompt = `You are a concise strength coach. A user just logged a set.
Exercise: ${exerciseName}
Logged: ${loggedWeight} lbs × ${loggedReps} reps @ RIR ${loggedRIR}
Target: ${targetReps} reps @ RIR ${targetRIR}
Feedback: ${feedback || 'none'}

Give ONE short coaching note (max 15 words). Be specific and actionable. No greeting.`;

        const result = await generateText({
          model: google('gemini-1.5-flash'),
          prompt,
          maxOutputTokens: 50,
        });
        return NextResponse.json({ note: result.text.trim() });
      } catch {
        return NextResponse.json({ note: '' });
      }
    }

    // 3. Check rate limit (workout generation only — not set_note)
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      console.warn(`[API /coach] Rate limit exceeded`);
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Please wait a minute before generating another workout',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // ── WORKOUT GENERATION MODE ────────────────────────────────────────────────
    if (!workoutType) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'workoutType is required for workout generation' },
        { status: 400 }
      );
    }

    console.log(`[API /coach] Generating workout: ${workoutType} (${timeAvailable}min, energy: ${energyLevel}/10)`);

    // 4. Build AI context (fetches user data from Supabase)
    let context;
    try {
      context = await buildAIContext(userId, workoutType);
      console.log(
        `[API /coach] Context built successfully:`,
        `Previous workouts: ${context.lastTwoWorkouts.length}`,
        `PRs: ${context.personalRecords.length}`
      );
    } catch (error) {
      console.error('[API /coach] Error building context:', error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        {
          error: 'Context Builder Failed',
          message: 'Failed to fetch your workout history. Please try again.',
          details: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
        },
        { status: 500 }
      );
    }

    // 5. Build prompt message
    const userMessage = buildContextMessage(context, timeAvailable, energyLevel, coachNotes);

    // 6. Call Gemini AI
    console.log('[API /coach] Calling Gemini AI...');

    let result;
    try {
      result = await generateObject({
        model: google('gemini-2.5-flash'), // Updated to current model (was gemini-1.5-pro)
        system: COACH_SYSTEM_PROMPT,
        prompt: userMessage,
        schema: WorkoutResponseSchema,
        temperature: 0.7, // Some creativity but mostly consistent
        maxRetries: 3, // Retry on failures
      });

      console.log('[API /coach] AI generation complete');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Only log full details in development to avoid leaking internals
      if (process.env.NODE_ENV !== 'production') {
        console.error('[API /coach] Gemini API error:', error);
        console.error('[API /coach] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      } else {
        console.error('[API /coach] Gemini API error:', errorMessage.slice(0, 200));
      }

      // Handle specific API errors

      if (errorMessage.includes('API key')) {
        return NextResponse.json(
          {
            error: 'Configuration Error',
            message: 'AI service is not properly configured. Please contact support.',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Service Unavailable',
            message: 'AI service is temporarily unavailable. Please try again in a few minutes.',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: 'AI Generation Failed',
          message: 'Failed to generate workout. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }

    // 7. Validate AI response
    const workout = result.object;

    if (!validateAIResponse(workout)) {
      console.error('[API /coach] Invalid AI response structure:', workout);
      return NextResponse.json(
        {
          error: 'AI Response Invalid',
          message: 'AI generated an invalid workout. Please try again.',
        },
        { status: 500 }
      );
    }

    // 8. Log success metrics
    const duration = Date.now() - startTime;
    console.log(`[API /coach] Success! Generated in ${duration}ms`);
    console.log(`[API /coach] Workout: ${workout.workoutType} with ${workout.exercises.length} exercises`);

    // 9. Return successful response
    return NextResponse.json(
      {
        success: true,
        data: workout,
        meta: {
          generationTime: duration,
          contextQuality: {
            hasPreviousWorkouts: context.lastTwoWorkouts.length > 0,
            hasPersonalRecords: context.personalRecords.length > 0,
            userTrainingAge: context.userProfile.trainingAge,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    // Catch-all error handler
    console.error('[API /coach] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler (Health Check)
// ============================================================================

export async function GET() {
  return NextResponse.json(
    {
      service: 'AI Coach API',
      status: 'operational',
      version: '1.0.0',
      endpoints: {
        POST: '/api/coach',
      },
      rateLimit: {
        window: '1 minute',
        max: RATE_LIMIT_MAX,
      },
    },
    { status: 200 }
  );
}

