import { generateToken, isJwtConfigured, toPublicUser } from '@/lib/auth';
import { json, jsonWithSession } from '@/lib/http';
import { hashPassword } from '@/lib/password';
import { assertSafePassword } from '@/lib/pwned-password';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { withStore } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { registerWithSupabase } from '@/lib/supabase-auth';
import { isEmail, sanitizeText } from '@/lib/validate';
import type { User, UserRole } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return json({ message: 'Terlalu banyak percobaan. Coba lagi nanti' }, 429);
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      adminSecret?: string;
    };
    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email).toLowerCase();
    const password = String(body.password || '');
    const setupSecret = String(process.env.ADMIN_SETUP_SECRET ?? '').trim();
    const role: UserRole =
      setupSecret && sanitizeText(body.adminSecret) === setupSecret && body.role === 'admin'
        ? 'admin'
        : 'student';

    if (name.length < 2 || name.length > 100) {
      return json({ message: 'Name must be between 2 and 100 characters' }, 400);
    }
    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);
    const pw = await assertSafePassword(password);
    if (pw) return json({ message: pw }, 400);

    if (!isJwtConfigured()) {
      return json({ message: 'JWT_SECRET is not configured' }, 500);
    }

    if (isSupabaseEnabled()) {
      try {
        const result = await registerWithSupabase({ name, email, password, role });
        return jsonWithSession(
          { message: result.message, user: result.user, token: result.token },
          result.token,
          result.status,
        );
      } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Registration failed' }, 400);
      }
    }

    return withStore(async (store) => {
      const existing = store.users.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        return json({ message: 'Email sudah terdaftar. Silakan login' }, 409);
      }

      const newUser: User = {
        id: store.counters.nextUserId++,
        name,
        email,
        password: await hashPassword(password),
        role,
        createdAt: new Date().toISOString(),
      };
      store.users.push(newUser);
      const token = generateToken(newUser);
      return jsonWithSession(
        {
          message: 'User registered successfully',
          user: toPublicUser(newUser),
          token,
        },
        token,
        201,
      );
    });
  } catch {
    return json({ message: 'Registration failed. Please try again.' }, 500);
  }
}
