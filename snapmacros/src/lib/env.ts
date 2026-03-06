/**
 * Startup env validation. Throws if required vars are missing.
 * Call this from next.config or a root layout/layout so it runs early.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optional = ["ANTHROPIC_API_KEY"] as const;

export function validateEnv(): void {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }
}

export function getEnv<K extends (typeof required)[number]>(key: K): string {
  const v = process.env[key];
  if (!v?.trim()) throw new Error(`Missing env: ${key}`);
  return v.trim();
}

export function getOptionalEnv<K extends (typeof optional)[number]>(key: K): string | undefined {
  return process.env[key]?.trim();
}
