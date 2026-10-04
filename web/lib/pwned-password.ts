import { createHash } from 'crypto';
import { validatePasswordFormat } from './validate';

/** NIST: cek password bocor lewat HIBP k-anonymity (hanya 5 karakter hash yang dikirim). */
export async function isPwnedPassword(password: string): Promise<boolean> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true', 'User-Agent': 'lms-platform' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const body = await response.text();
    return body.split(/\r?\n/).some((line) => line.split(':')[0] === suffix);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function assertSafePassword(password: string): Promise<string | null> {
  const format = validatePasswordFormat(password);
  if (!format.valid) return format.message;
  if (await isPwnedPassword(password)) {
    return 'Password ini pernah muncul di kebocoran data. Gunakan password unik yang belum pernah dipakai di situs lain';
  }
  return null;
}
