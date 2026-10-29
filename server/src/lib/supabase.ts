import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
}

// We use the anon key here; RLS on the user's behalf is enforced
// by creating a client with the user's JWT access token per request.
export function getSupabaseClient(accessToken?: string) {
  const client = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false },
  });
  return client;
}
