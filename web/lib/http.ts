import { getBearerUser } from './auth';
import type { PublicUser, UserRole } from './types';

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export function requireUser(request: Request, role?: UserRole): PublicUser | Response {
  const user = getBearerUser(request);
  if (!user) return json({ message: 'Authentication required' }, 401);
  if (role && user.role !== role) {
    const message = role === 'admin' ? 'Admin access required' : 'Student access required';
    return json({ message }, 403);
  }
  return user;
}

export function isResponse(value: PublicUser | Response): value is Response {
  return value instanceof Response;
}
