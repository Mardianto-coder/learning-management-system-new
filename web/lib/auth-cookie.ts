export const AUTH_COOKIE = 'lms_token';

function isSecureCookie(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function serializeAuthCookie(token: string, maxAgeSec = 60 * 60 * 24): string {
  const parts = [
    `${AUTH_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (isSecureCookie()) parts.push('Secure');
  return parts.join('; ');
}

export function expireAuthCookie(): string {
  const parts = [`${AUTH_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecureCookie()) parts.push('Secure');
  return parts.join('; ');
}

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}
