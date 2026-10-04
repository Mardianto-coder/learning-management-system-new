import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const DUMMY_HASH = '$2a$12$1JlgvHAiHYH/YGFmpzMfTe9hWoXwcD8jRscx1in6c71qyfpd2CWO6';

export async function verifyPasswordOrDummy(password: string, hash?: string | null): Promise<boolean> {
  return bcrypt.compare(password, hash || DUMMY_HASH);
}
