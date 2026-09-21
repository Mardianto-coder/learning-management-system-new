import { generateToken, toPublicUser } from '@/lib/auth';
import { json } from '@/lib/http';
import { verifyPassword } from '@/lib/password';
import { withStoreRead } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { loginWithSupabase } from '@/lib/supabase-auth';
import { isEmail, isRole, sanitizeText } from '@/lib/validate';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; role?: string };
    const email = sanitizeText(body.email).toLowerCase();
    const password = String(body.password || '');
    const role = body.role as UserRole;

    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);
    if (!password) return json({ message: 'Password is required' }, 400);
    if (!isRole(role)) return json({ message: 'Role must be either student or admin' }, 400);

    if (isSupabaseEnabled()) {
      try {
        const result = await loginWithSupabase(email, password, role);
        return json(result);
      } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Login failed' }, 401);
      }
    }

    return withStoreRead(async (store) => {
      const user = store.users.find((u) => u.email.toLowerCase() === email);
      if (!user?.password) return json({ message: 'Invalid credentials' }, 401);
      const ok = await verifyPassword(password, user.password);
      if (!ok) return json({ message: 'Invalid credentials' }, 401);
      if (user.role !== role) return json({ message: 'Role mismatch' }, 401);
      return json({
        message: 'Login successful',
        user: toPublicUser(user),
        token: generateToken(user),
      });
    });
  } catch {
    return json({ message: 'Login failed. Please try again.' }, 500);
  }
}
