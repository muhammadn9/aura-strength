/**
 * Next.js Instrumentation
 *
 * Called once when the Next.js server starts.
 * Used to validate environment variables at startup (refs #64).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  const { validateServerEnv } = await import('@/lib/env');
  validateServerEnv();
}

