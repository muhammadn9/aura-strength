/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to provide
 * clear error messages instead of cryptic crashes from non-null assertions.
 *
 * getEnv() uses direct process.env property access (not dynamic indexing)
 * so Next.js can statically inline NEXT_PUBLIC_* vars in client/edge bundles.
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

type EnvVarName = (typeof requiredEnvVars)[number] | (typeof serverOnlyEnvVars)[number];

export function validateEnv(): void {
  const missing: string[] = [];

  // Use direct property access for each required var
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file or Vercel environment settings.`
    );
  }
}

export function validateServerEnv(): void {
  validateEnv();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn(
      `⚠️ Missing optional server environment variable: GOOGLE_GENERATIVE_AI_API_KEY\n` +
      `Some features (AI Coach) may not work correctly.`
    );
  }
}

/**
 * Get a validated environment variable. Uses direct process.env property
 * access (not dynamic indexing) so Next.js can statically inline
 * NEXT_PUBLIC_* vars in client and edge bundles.
 */
export function getEnv(name: EnvVarName): string {
  let value: string | undefined;

  switch (name) {
    case 'NEXT_PUBLIC_SUPABASE_URL':
      value = process.env.NEXT_PUBLIC_SUPABASE_URL;
      break;
    case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
      value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      break;
    case 'GOOGLE_GENERATIVE_AI_API_KEY':
      value = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      break;
    default: {
      const _exhaustiveCheck: never = name;
      throw new Error(`Unhandled environment variable: ${_exhaustiveCheck as string}`);
    }
  }

  if (!value) {
    throw new Error(
      `Environment variable ${name} is not set. ` +
      `Please check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

