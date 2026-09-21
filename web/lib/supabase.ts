import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(name: string): string {
  return String(process.env[name] ?? '').trim();
}

export function isSupabaseEnabled(): boolean {
  return Boolean(readEnv('NEXT_PUBLIC_SUPABASE_URL') && readEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di web/.env.local');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
