import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(name: string): string {
  return String(process.env[name] ?? '').trim();
}

export function isSupabaseEnabled(): boolean {
  return Boolean(readEnv('NEXT_PUBLIC_SUPABASE_URL') && readEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getSupabaseUrl(): string {
  return readEnv('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function isSupabaseAnonEnabled(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function publicAppOrigin(request: Request): string {
  const fromEnv = readEnv('NEXT_PUBLIC_SITE_URL');
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const vercel = readEnv('VERCEL_URL');
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getSupabaseServiceKey(): string {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY');
}

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) {
    throw new Error('Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di web/.env.local');
  }
  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { Authorization: `Bearer ${key}` },
    },
  });
  return adminClient;
}
