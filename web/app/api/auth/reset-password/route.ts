import { json } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';
import { isEmail, sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = sanitizeText(body.email).toLowerCase();
    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);

    return withStoreRead(async (store) => {
      const user = store.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        return json({ message: 'If the email exists, a password reset link would be sent.' });
      }
      return json({
        message: 'Password reset initiated. Please use register form with your email to set a new password.',
        email,
      });
    });
  } catch {
    return json({ message: 'Password reset failed. Please try again.' }, 500);
  }
}
