/**
 * Password Utilities
 * 
 * Fungsi untuk hashing dan verifying password dengan bcrypt
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash password menggunakan bcrypt
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password dengan hash yang tersimpan
 * 
 * @param password - Plain text password
 * @param hash - Hashed password dari database
 * @returns true jika password cocok, false jika tidak
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

