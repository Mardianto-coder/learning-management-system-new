import { json } from '@/lib/http';
import { clientIp, rateLimit, tooManyTriesMessage } from '@/lib/rate-limit';
import { assertSafePassword } from '@/lib/pwned-password';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = rateLimit(`pw-policy:${clientIp(request)}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return json({ message: tooManyTriesMessage(limited.retryAfterSec) }, 429, {
      'Retry-After': String(limited.retryAfterSec),
    });
  }
  try {
    const body = (await request.json()) as { password?: string };
    const message = await assertSafePassword(String(body.password || ''));
    if (message) return json({ message }, 400);
    return json({ ok: true });
  } catch {
    return json({ message: 'Gagal memeriksa password' }, 500);
  }
}