import jwt, { type SignOptions } from 'jsonwebtoken';
import { AUTH_COOKIE, readCookie } from './auth-cookie';
import type { PublicUser, User, UserRole } from './types';

function jwtSecretValue(): string {
  const dedicated = String(process.env.JWT_SECRET ?? '').trim();
  if (dedicated) return dedicated;
  return String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
}

export function isJwtConfigured(): boolean {
  return Boolean(jwtSecretValue());
}

function getJwtSecret(): string {
  const secret = jwtSecretValue();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

const signOptions: SignOptions = {
  algorithm: 'HS256',
  expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'],
  issuer: 'lms-platform',
};

export function generateToken(user: User | PublicUser): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), signOptions);
}

export function verifyToken(token: string): { id: number; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'lms-platform',
    });
    return readPayload(decoded);
  } catch {
    try {
      return readPayload(jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }));
    } catch {
      return null;
    }
  }
}

function readPayload(decoded: unknown): { id: number; email: string; role: UserRole } | null {
  if (
    typeof decoded === 'object' &&
    decoded !== null &&
    'id' in decoded &&
    'email' in decoded &&
    'role' in decoded
  ) {
    return decoded as { id: number; email: string; role: UserRole };
  }
  return null;
}

export function getBearerUser(request: Request): PublicUser | null {
  const header = request.headers.get('authorization') || '';
  const fromHeader = header.startsWith('Bearer ') ? header.slice(7) : '';
  const fromCookie = readCookie(request, AUTH_COOKIE) || '';
  const token = fromHeader || fromCookie;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return { id: decoded.id, name: '', email: decoded.email, role: decoded.role };
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, profile: user.profile };
}
