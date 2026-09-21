import type { CourseCategory, UserRole } from './types';

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePasswordFormat(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password harus minimal 6 karakter' };
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
