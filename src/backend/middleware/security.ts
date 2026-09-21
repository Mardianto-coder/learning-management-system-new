/**
 * Security Middleware
 * 
 * Middleware untuk keamanan aplikasi:
 * - Input validation
 * - Sanitization
 * - Rate limiting
 * - Security headers
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain, ValidationError } from 'express-validator';

/**
 * Validasi email
 */
export const validateEmail = (): ValidationChain => {
    return body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .trim();
};

/**
 * Validasi password
 * Password harus memenuhi:
 * - Minimal 6 karakter
 * - Minimal 1 uppercase letter
 * - Minimal 1 lowercase letter
 * - Minimal 1 number
 */
export const validatePassword = (): ValidationChain => {
    return body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .trim();
};

/**
 * Validasi name
 */
export const validateName = (): ValidationChain => {
    return body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .trim()
        .escape();
};

/**
 * Validasi role
 */
export const validateRole = (): ValidationChain => {
    return body('role')
        .isIn(['student', 'admin'])
        .withMessage('Role must be either student or admin');
};

/**
 * Validasi course data
 */
export const validateCourseData = (): ValidationChain[] => {
    return [
        body('title')
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters')
            .trim()
            .escape(),
        body('description')
            .isLength({ min: 10, max: 2000 })
            .withMessage('Description must be between 10 and 2000 characters')
            .trim()
            .escape(),
        body('category')
            .isIn(['programming', 'design', 'business', 'language'])
            .withMessage('Invalid category'),
        body('duration')
            .isInt({ min: 1, max: 1000 })
            .withMessage('Duration must be a number between 1 and 1000')
    ];
};

/**
 * Validasi course data (optional untuk update)
 */
export const validateCourseDataOptional = (): ValidationChain[] => {
    return [
        body('title')
            .optional()
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters')
            .trim()
            .escape(),
        body('description')
            .optional()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Description must be between 10 and 2000 characters')
            .trim()
            .escape(),
        body('category')
            .optional()
            .isIn(['programming', 'design', 'business', 'language'])
            .withMessage('Invalid category'),
        body('duration')
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage('Duration must be a number between 1 and 1000')
    ];
};

/**
 * Validasi assignment data
 */
export const validateAssignmentData = (): ValidationChain[] => {
    return [
        body('courseId')
            .isInt({ min: 1 })
            .withMessage('Course ID must be a valid number'),
        body('title')
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters')
            .trim()
            .escape(),
        body('content')
            .isLength({ min: 10, max: 10000 })
            .withMessage('Content must be between 10 and 10000 characters')
            .trim()
    ];
};

/**
 * Middleware untuk mengecek hasil validasi
 */
export const checkValidation = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map((err: ValidationError) => ({
                field: err.type === 'field' ? (err as any).path : 'unknown',
                message: err.msg
            }))
        });
        return;
    }
    next();
};

/**
 * Sanitize input untuk mencegah XSS
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remove potentially dangerous characters
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
        });
    }
    next();
};

/**
 * Error handler yang aman (tidak leak informasi)
 */
export const safeErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);
    
    // Jangan expose error details ke client
    res.status(500).json({
        message: 'An error occurred. Please try again later.'
    });
};

