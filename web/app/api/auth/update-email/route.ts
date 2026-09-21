import { generateToken, toPublicUser } from '@/lib/auth';
import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { isEmail, sanitizeText } from '@/lib/validate';
import { isSupabaseEnabled } from '@/lib/supabase';
import { updateSupabaseEmail } from '@/lib/supabase-auth';

export const runtime = 'nodejs';

export async function PUT(request: Request) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;

  try {
    const body = (await request.json()) as { email?: string };
    const newEmail = sanitizeText(body.email).toLowerCase();
    if (!isEmail(newEmail)) return json({ message: 'Invalid email format' }, 400);

    return withStore(async (store) => {
      const user = store.users.find((u) => u.id === auth.id);
      if (!user) return json({ message: 'User not found' }, 404);
      const taken = store.users.find((u) => u.email.toLowerCase() === newEmail && u.id !== user.id);
      if (taken) return json({ message: 'Email already registered' }, 400);
      if (isSupabaseEnabled() && user.authId) {
        await updateSupabaseEmail(user.authId, newEmail);
      }
      user.email = newEmail;
      return json({
        message: 'Email updated successfully',
        user: toPublicUser(user),
        token: generateToken(user),
      });
    });
  } catch {
    return json({ message: 'Failed to update email' }, 500);
  }
}
