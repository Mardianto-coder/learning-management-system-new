import { json } from '@/lib/http';
import { clientIp, rateLimit, tooManyTriesMessage } from '@/lib/rate-limit';
import { isEmail, sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

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
    if (!isEmail(email)) return json({ message: 'Invalid email format' }, 400);

    return json({
      message:
        'Jika email terdaftar, admin dapat mereset akun. Untuk ganti password, login dulu lalu buka Ubah Password.',
    });
  } catch {
    return json({ message: 'Password reset failed. Please try again.' }, 500);
  }
}
