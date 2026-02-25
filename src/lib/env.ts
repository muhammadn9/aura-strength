/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to provide
 * clear error messages instead of cryptic crashes from non-null assertions.
 *
 * refs #64
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const serverOnlyEnvVars = [
  'GOOGLE_GENERATIVE_AI_API_KEY',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file or Vercel environment settings.`
    );
  }
}

export function validateServerEnv(): void {
  validateEnv();

  const missing: string[] = [];

  for (const envVar of serverOnlyEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing optional server environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n` +
      `Some features (AI Coach) may not work correctly.`
    );
  }
}

/**
 * Get a validated environment variable. Throws a descriptive error
 * if the variable is not set, instead of returning undefined.
 */
export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is not set. ` +
      `Please check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

