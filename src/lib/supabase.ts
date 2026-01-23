import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // We log a warning instead of throwing to prevent build crashes
  // during Next.js prerendering phases.
  console.warn('Supabase environment variables are missing. Please check your .env files or Vercel settings.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
