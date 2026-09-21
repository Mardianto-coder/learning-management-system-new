/**
 * Authentication Middleware
 * 
 * Middleware untuk JWT authentication dan authorization
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, UserRole } from '../../types/index';

// Extend Express Request to include user
export interface AuthRequest extends Request {
    user?: User;
}

// JWT Secret - WAJIB dari environment variable untuk keamanan
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Validasi JWT_SECRET saat module load
if (!JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET environment variable is not set!');
    console.error('   Please set JWT_SECRET in your .env file or environment variables.');
    console.error('   For development, you can create a .env file with: JWT_SECRET=your-secret-key-here');
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
}

// Type guard untuk memastikan JWT_SECRET tidak undefined
function getJwtSecret(): string {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return JWT_SECRET;
}

/**
 * Generate JWT token untuk user
 */
export function generateToken(user: User): string {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { id: number; email: string; role: UserRole } | null {
    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        
        // Type guard untuk memastikan decoded memiliki struktur yang benar
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
            return decoded as { id: number; email: string; role: UserRole };
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Middleware untuk authenticate user dengan JWT
 */
export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    
    // Attach user info to request
    req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
    } as User;
    
    next();
}

/**
 * Middleware untuk require admin role
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
}

/**
 * Middleware untuk require student role
 */
export function requireStudent(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.user?.role !== 'student') {
        res.status(403).json({ message: 'Student access required' });
        return;
    }
    next();
}

