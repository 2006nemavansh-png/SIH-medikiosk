import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// MediKiosk has no login screen: each kiosk browser session gets a Supabase
// anonymous-auth identity so RLS policies can scope patients/visits/documents
// rows to the session that created them, instead of leaving every row
// readable/writable by anyone holding the public anon key. Call this before
// any read or write against those tables.
export async function ensureAnonymousSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: signInData, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signInData.session;
}
