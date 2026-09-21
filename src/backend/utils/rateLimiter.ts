/**
 * Rate Limiting
 * 
 * Mencegah brute force attacks dengan membatasi jumlah request
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter untuk authentication endpoints
 * Maksimal 5 request per 15 menit per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // 5 request per window
    message: { message: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Skip jika request berhasil
});

/**
 * Rate limiter untuk API endpoints umum
 * Maksimal 100 request per 15 menit per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per window
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

