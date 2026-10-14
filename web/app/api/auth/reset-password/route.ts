import { createClient } from '@supabase/supabase-js';
import { json } from '@/lib/http';
import { clientIp, rateLimit, tooManyTriesMessage } from '@/lib/rate-limit';
import { isEmail, sanitizeText } from '@/lib/validate';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseAnonEnabled, publicAppOrigin } from '@/lib/supabase';

export const runtime = 'nodejs';

const GENERIC_MESSAGE =
  'Jika email terdaftar, tautan reset dikirim. Cek inbox dan folder spam. Tautan biasanya berlaku sekitar satu jam.';

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return json({ message: tooManyTriesMessage(limited.retryAfterSec) }, 429, {
        'Retry-After': String(limited.retryAfterSec),
      });
    }

    const body = (await request.json()) as { email?: string };
    const email = sanitizeText(body.email).toLowerCase();
    if (!isEmail(email)) return json({ message: 'Format email tidak valid' }, 400);

    if (isSupabaseAnonEnabled()) {
      const redirectTo = `${publicAppOrigin(request)}/reset-password`;
      const anon = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      await anon.auth.resetPasswordForEmail(email, { redirectTo });
    }

    return json({ message: GENERIC_MESSAGE });
  } catch {
    return json({ message: GENERIC_MESSAGE });
  }
}