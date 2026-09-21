import jwt, { type SignOptions } from 'jsonwebtoken';
import type { PublicUser, User, UserRole } from './types';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function generateToken(user: User | PublicUser): string {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): { id: number; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
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
  } catch {
    return null;
  }
}

export function getBearerUser(request: Request): PublicUser | null {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const decoded = verifyToken(header.slice(7));
  if (!decoded) return null;
  return { id: decoded.id, name: '', email: decoded.email, role: decoded.role };
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
