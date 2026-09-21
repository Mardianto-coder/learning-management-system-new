import { generateToken, toPublicUser } from '@/lib/auth';
import { json } from '@/lib/http';
import { hashPassword } from '@/lib/password';
import { withStore } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { registerWithSupabase } from '@/lib/supabase-auth';
import { isEmail, isRole, sanitizeText, validatePasswordFormat } from '@/lib/validate';
import type { User, UserRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };
    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email).toLowerCase();
    const password = String(body.password || '');
    const role = body.role as UserRole;

    if (name.length < 2 || name.length > 100) {
      return json({ message: 'Name must be between 2 and 100 characters' }, 400);
    }
    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);
    if (!isRole(role)) return json({ message: 'Role must be either student or admin' }, 400);
    const pw = validatePasswordFormat(password);
    if (!pw.valid) return json({ message: pw.message }, 400);

    if (isSupabaseEnabled()) {
      try {
        const result = await registerWithSupabase({ name, email, password, role });
        return json(
          { message: result.message, user: result.user, token: result.token },
          result.status,
        );
      } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Registration failed' }, 400);
      }
    }

    return withStore(async (store) => {
      const existing = store.users.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        existing.password = await hashPassword(password);
        existing.name = name;
        existing.role = role;
        const token = generateToken(existing);
        return json({
          message: 'Password updated successfully. You can now login with your new password.',
          user: toPublicUser(existing),
          token,
        });
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
      return json(
        {
          message: 'User registered successfully',
          user: toPublicUser(newUser),
          token,
        },
        201,
      );
    });
  } catch {
    return json({ message: 'Registration failed. Please try again.' }, 500);
  }
}
