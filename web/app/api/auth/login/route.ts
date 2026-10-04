import { generateToken, toPublicUser } from '@/lib/auth';
import { json, jsonWithSession } from '@/lib/http';
import { verifyPasswordOrDummy } from '@/lib/password';
import { clientIp, rateLimit, tooManyTriesMessage } from '@/lib/rate-limit';
import { withStoreRead } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { loginWithSupabase } from '@/lib/supabase-auth';
import { isEmail, isRole, sanitizeText } from '@/lib/validate';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`login:${clientIp(request)}`, 30, 15 * 60 * 1000);
    if (!limited.ok) {
      return json({ message: tooManyTriesMessage(limited.retryAfterSec) }, 429, {
        'Retry-After': String(limited.retryAfterSec),
      });
    }

    const body = (await request.json()) as { email?: string; password?: string; role?: string };
    const email = sanitizeText(body.email).toLowerCase();
    const password = String(body.password || '');
    const role = body.role as UserRole;

    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);
    if (!password) return json({ message: 'Password is required' }, 400);
    if (!isRole(role)) return json({ message: 'Pilih peran: siswa/mahasiswa atau admin/dosen' }, 400);

    if (isSupabaseEnabled()) {
      try {
        const result = await loginWithSupabase(email, password, role);
        return jsonWithSession(result, result.token);
      } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Invalid credentials' }, 401);
      }
    }

    return withStoreRead(async (store) => {
      const user = store.users.find((u) => u.email.toLowerCase() === email);
      const ok = await verifyPasswordOrDummy(password, user?.password);
      if (!user || !ok) return json({ message: 'Invalid credentials' }, 401);
      if (user.role !== role) {
        return json(
          {
            message:
              role === 'admin'
                ? 'Akun ini terdaftar sebagai siswa/mahasiswa. Pilih peran yang sesuai.'
                : 'Akun ini terdaftar sebagai admin/dosen. Pilih peran yang sesuai.',
          },
          401,
        );
      }
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
