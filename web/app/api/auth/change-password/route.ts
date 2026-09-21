import { json, isResponse, requireUser } from '@/lib/http';
import { hashPassword, verifyPassword } from '@/lib/password';
import { withStore } from '@/lib/storage';
import { isSupabaseEnabled } from '@/lib/supabase';
import { loginWithSupabase, updateSupabasePassword } from '@/lib/supabase-auth';
import { validatePasswordFormat } from '@/lib/validate';

export const runtime = 'nodejs';

export async function PUT(request: Request) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;

  try {
    const body = (await request.json()) as { currentPassword?: string; password?: string };
    const currentPassword = String(body.currentPassword || '');
    const password = String(body.password || '');
    if (!currentPassword) return json({ message: 'Current password is required' }, 400);
    const pw = validatePasswordFormat(password);
    if (!pw.valid) return json({ message: pw.message }, 400);

    return withStore(async (store) => {
      const user = store.users.find((u) => u.id === auth.id);
      if (!user) return json({ message: 'User not found' }, 404);
      if (isSupabaseEnabled()) {
        await loginWithSupabase(user.email, currentPassword, user.role);
        if (user.authId) await updateSupabasePassword(user.authId, password);
        return json({ message: 'Password changed successfully' });
      }
      if (!user.password) return json({ message: 'User not found' }, 404);
      const ok = await verifyPassword(currentPassword, user.password);
      if (!ok) return json({ message: 'Current password is incorrect' }, 401);
      user.password = await hashPassword(password);
      return json({ message: 'Password changed successfully' });
    });
  } catch {
    return json({ message: 'Failed to change password' }, 500);
  }
}
