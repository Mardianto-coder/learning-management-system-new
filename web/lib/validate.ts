import type { CourseCategory, UserRole } from './types';

const COMMON_PASSWORDS = new Set(
  [
    'password',
    'password1',
    'password123',
    'qwerty123',
    'qwertyui',
    '12345678',
    '123456789',
    '1234567890',
    '11111111',
    '00000000',
    'abc12345',
    'iloveyou',
    'admin123',
    'welcome1',
    'letmein1',
    'monkey12',
    'dragon12',
    'sunshine',
    'football',
    'baseball',
    'superman',
    'passw0rd',
  ].map((item) => item.toLowerCase()),
);

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePasswordFormat(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password harus minimal 8 karakter' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password maksimal 128 karakter' };
  }
  if (/\s/.test(password)) {
    return { valid: false, message: 'Password tidak boleh mengandung spasi' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal 1 huruf kecil' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal 1 huruf besar' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password harus mengandung minimal 1 angka' };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, message: 'Password terlalu umum. Pilih yang tidak mudah ditebak' };
  }
  return { valid: true, message: '' };
}

export function isRole(value: string): value is UserRole {
  return value === 'student' || value === 'admin';
}

export function isCategory(value: string): value is CourseCategory {
  return ['programming', 'design', 'business', 'language'].includes(value);
}

export function sanitizeText(value: unknown): string {
  return String(value ?? '').trim();
}
