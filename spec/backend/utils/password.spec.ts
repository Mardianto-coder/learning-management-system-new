/**
 * Unit Test untuk Password Utilities
 * 
 * CATATAN KEAMANAN: Password yang digunakan di file ini adalah TEST-ONLY values
 * yang jelas-jelas bukan password real. Semua password di sini hanya untuk keperluan testing.
 */

import { hashPassword, verifyPassword } from '../../../src/backend/utils/password';

describe('Password Utilities', () => {
    
    describe('hashPassword', () => {
        
        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should hash a password successfully', async () => {
            const password = 'TEST_Password123';
            const hash = await hashPassword(password);
            
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(0);
            expect(hash).not.toBe(password);
            // Bcrypt hash selalu dimulai dengan $2b$ atau $2a$
            expect(hash).toMatch(/^\$2[ab]\$/);
        });

        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should produce different hashes for the same password', async () => {
            const password = 'TEST_Password123';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            
            // Bcrypt menghasilkan hash berbeda setiap kali (karena salt)
            expect(hash1).not.toBe(hash2);
        });

    });

    describe('verifyPassword', () => {
        
        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should verify correct password successfully', async () => {
            const password = 'TEST_Password123';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);
            
            expect(isValid).toBe(true);
        });

        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should reject incorrect password', async () => {
            const password = 'TEST_Password123';
            const wrongPassword = 'TEST_WrongPassword456';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);
            
            expect(isValid).toBe(false);
        });

        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should reject empty password', async () => {
            const password = 'TEST_Password123';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword('', hash);
            
            expect(isValid).toBe(false);
        });

        // TEST-ONLY: Password ini hanya untuk testing, bukan password real
        it('should handle case-sensitive passwords', async () => {
            const password = 'TEST_Password123';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword('test_password123', hash);
            
            expect(isValid).toBe(false);
        });

    });

});

