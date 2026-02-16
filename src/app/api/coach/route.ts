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
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// Request/Response Schemas
// ============================================================================

const RequestSchema = z.object({
  workoutType: z.string().min(1, 'Workout type is required'),
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
// Rate Limiting (Simple in-memory)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    rateLimitMap.delete(userId);
  }

  const current = rateLimitMap.get(userId);

  if (!current) {
    // First request
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  current.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - current.count };
}

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

    console.log(`[API /coach] Request from user: ${user.id}`);

    // 2. Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.warn(`[API /coach] Rate limit exceeded for user: ${user.id}`);
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
            'X-RateLimit-Reset': Date.now().toString(),
          },
        }
      );
    }

    // 3. Parse and validate request body
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

    const { workoutType } = validation.data;
    console.log(`[API /coach] Generating workout: ${workoutType}`);

    // 4. Build AI context (fetches user data from Supabase)
    let context;
    try {
      context = await buildAIContext(user.id, workoutType);
      console.log(
        `[API /coach] Context built successfully:`,
        `User: ${context.userProfile.userId}`,
        `Age: ${context.userProfile.age}`,
        `Previous workouts: ${context.lastTwoWorkouts.length}`,
        `PRs: ${context.personalRecords.length}`
      );
    } catch (error) {
      console.error('[API /coach] Error building context:', error);
      console.error('[API /coach] Error details:', {
        userId: user.id,
        workoutType,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
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
    const userMessage = buildContextMessage(context);

    // 6. Call Gemini AI
    console.log('[API /coach] Calling Gemini AI...');
    console.log('[API /coach] Using API key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET (length: ' + process.env.GOOGLE_GENERATIVE_AI_API_KEY.length + ')' : 'NOT SET');

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
      console.error('[API /coach] Gemini API error:', error);
      console.error('[API /coach] Error type:', error?.constructor?.name);
      console.error('[API /coach] Error details:', JSON.stringify(error, null, 2));

      // Handle specific API errors
      const errorMessage = error instanceof Error ? error.message : String(error);

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

