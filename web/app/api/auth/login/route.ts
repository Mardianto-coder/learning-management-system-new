import { generateToken, toPublicUser } from '@/lib/auth';
import { json, jsonWithSession } from '@/lib/http';
import { verifyPasswordOrDummy } from '@/lib/password';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { withStoreRead } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { loginWithSupabase } from '@/lib/supabase-auth';
import { isEmail, sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return json({ message: 'Terlalu banyak percobaan login. Coba lagi nanti' }, 429);
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = sanitizeText(body.email).toLowerCase();
    const password = String(body.password || '');

    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);
    if (!password) return json({ message: 'Password is required' }, 400);

    if (isSupabaseEnabled()) {
      try {
        const result = await loginWithSupabase(email, password);
        return jsonWithSession(result, result.token);
      } catch {
        return json({ message: 'Invalid credentials' }, 401);
      }
    }

    return withStoreRead(async (store) => {
      const user = store.users.find((u) => u.email.toLowerCase() === email);
      const ok = await verifyPasswordOrDummy(password, user?.password);
      if (!user || !ok) return json({ message: 'Invalid credentials' }, 401);
      const token = generateToken(user);
      return jsonWithSession(
        {
          message: 'Login successful',
          user: toPublicUser(user),
          token,
        },
        token,
      );
    });
  } catch {
    return json({ message: 'Login failed. Please try again.' }, 500);
  }
}
