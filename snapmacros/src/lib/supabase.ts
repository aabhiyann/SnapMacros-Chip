import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

/**
 * Browser Supabase client. Use in Client Components only.
 * Env vars should be set (validate with env.ts at startup if needed).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createBrowserClient(url, key);
}
