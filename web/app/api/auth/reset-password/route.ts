import { json } from '@/lib/http';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isEmail, sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`reset:${clientIp(request)}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return json({ message: 'Terlalu banyak percobaan. Coba lagi nanti' }, 429);
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
