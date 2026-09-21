/**
 * Optimized and Secure LMS Server
 * 
 * Perbaikan yang dilakukan:
 * - Password hashing dengan bcrypt
 * - JWT authentication
 * - Input validation dan sanitization
 * - Rate limiting
 * - Security headers (helmet)
 * - Compression
 * - Async file I/O
 * - Error handling yang aman
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import helmet from 'helmet';
import { User, Course, Enrollment, Assignment, UserRole, CourseData, AssignmentData } from '../types/index';
import { 
    loadDataAsync, 
    saveUsersAsync, 
    saveCoursesAsync, 
    saveEnrollmentsAsync, 
    saveAssignmentsAsync, 
    saveCountersAsync 
} from './data-storage-async.js';
import { hashPassword, verifyPassword } from './utils/password.js';
import { generateToken, authenticateUser, requireAdmin, requireStudent, AuthRequest } from './middleware/auth.js';
import { 
    validateEmail, 
    validatePassword, 
    validateName, 
    validateRole,
    validateCourseData,
    validateCourseDataOptional,
    validateAssignmentData,
    checkValidation,
    sanitizeInput,
    safeErrorHandler
} from './middleware/security.js';
import { body } from 'express-validator';
import { authLimiter, apiLimiter } from './utils/rateLimiter.js';
import { compressionMiddleware } from './middleware/compression.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (needed for dynamic styling)
            // Remove unsafe-eval for better security
            // Note: onclick handlers in frontend should be refactored to event listeners for production
            scriptSrc: process.env.NODE_ENV === 'production' 
                ? ["'self'"] // Production: strict - no inline scripts
                : ["'self'", "'unsafe-inline'"], // Development: allow inline for onclick handlers
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, // Force HTTPS in production
        },
    },
    crossOriginEmbedderPolicy: false,
    // Additional security headers
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
}));

// CORS configuration (lebih secure)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compressionMiddleware);

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input
app.use(sanitizeInput);

// ============================================
// DATA STORAGE
// ============================================

let users: User[] = [];
let courses: Course[] = [];
let enrollments: Enrollment[] = [];
let assignments: Assignment[] = [];

let nextUserId = 1;
let nextCourseId = 1;
let nextAssignmentId = 1;

// Load data async saat startup
(async () => {
    try {
        const initialData = await loadDataAsync();
        users = initialData.users;
        courses = initialData.courses;
        enrollments = initialData.enrollments;
        assignments = initialData.assignments;
        nextUserId = initialData.counters.nextUserId;
        nextCourseId = initialData.counters.nextCourseId;
        nextAssignmentId = initialData.counters.nextAssignmentId;
        console.log('✅ Data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
})();

// Helper function untuk save counters
async function saveAllCounters(): Promise<void> {
    await saveCountersAsync({ nextUserId, nextCourseId, nextAssignmentId });
}

// ============================================
// ROUTES
// ============================================

// Serve index.html
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../../index.html'));
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * Register user baru
 * - Validasi input
 * - Hash password
 * - Rate limiting
 */
app.post('/api/auth/register', 
    authLimiter,
    validateName(),
    validateEmail(),
    validatePassword(),
    validateRole(),
    checkValidation,
    async (req: Request, res: Response) => {
        try {
            const { name, email, password, role }: { name: string; email: string; password: string; role: UserRole } = req.body;
            
            // Check if email already exists - jika ada, update password saja
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                // Update password untuk user yang sudah ada
                const hashedPassword = await hashPassword(password);
                existingUser.password = hashedPassword;
                existingUser.name = name; // Update name juga
                existingUser.role = role; // Update role juga
                
                await saveUsersAsync(users);
                
                // Generate token
                const token = generateToken(existingUser);
                
                res.status(200).json({
                    message: 'Password updated successfully. You can now login with your new password.',
                    user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role },
                    token
                });
                return;
            }
            
            // Hash password
            const hashedPassword = await hashPassword(password);
            
            const newUser: User = {
                id: nextUserId++,
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            await saveUsersAsync(users);
            await saveAllCounters();
            
            // Generate token
            const token = generateToken(newUser);
            
            res.status(201).json({
                message: 'User registered successfully',
                user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
                token
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Registration failed. Please try again.' });
        }
    }
);

/**
 * Login user
 * - Validasi input
 * - Verify password
 * - Generate JWT token
 * - Rate limiting
 */
app.post('/api/auth/login', 
    authLimiter,
    validateEmail(),
    body('password').notEmpty().withMessage('Password is required').trim(),
    validateRole(),
    checkValidation,
    async (req: Request, res: Response) => {
        try {
            const { email, password, role }: { email: string; password: string; role: UserRole } = req.body;
            
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user || !user.password) {
                // Jangan expose apakah email ada atau tidak
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            
            // Verify password
            const isValidPassword = await verifyPassword(password, user.password);
            
            if (!isValidPassword) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            
            if (user.role !== role) {
                res.status(401).json({ message: 'Role mismatch' });
                return;
            }
            
            // Generate token
            const token = generateToken(user);
            
            res.json({
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Login failed. Please try again.' });
        }
    }
);

/**
 * Reset password dengan email
 * - Validasi email
 * - Generate password baru atau update password
 * - Rate limiting
 */
app.post('/api/auth/reset-password',
    authLimiter,
    validateEmail(),
    checkValidation,
    async (req: Request, res: Response) => {
        try {
            const { email }: { email: string } = req.body;
            
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                // Jangan expose apakah email ada atau tidak
                res.status(200).json({ 
                    message: 'If the email exists, a password reset link would be sent.' 
                });
                return;
            }
            
            // Untuk development: langsung reset password
            // Untuk production: kirim email dengan reset token
            res.json({
                message: 'Password reset initiated. Please use register form with your email to set a new password.',
                email: email.toLowerCase()
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Password reset failed. Please try again.' });
        }
    }
);

/**
 * Change password (untuk user yang sudah login)
 * - Authentication required
 * - Validasi password baru
 */
app.put('/api/auth/change-password',
    apiLimiter,
    authenticateUser,
    body('currentPassword').notEmpty().withMessage('Current password is required').trim(),
    validatePassword(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const { currentPassword, password: newPassword }: { currentPassword: string; password: string } = req.body;
            
            const user = users.find(u => u.id === req.user!.id);
            
            if (!user || !user.password) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            // Verify current password
            const isValidPassword = await verifyPassword(currentPassword, user.password);
            
            if (!isValidPassword) {
                res.status(401).json({ message: 'Current password is incorrect' });
                return;
            }
            
            // Hash new password
            const hashedPassword = await hashPassword(newPassword);
            user.password = hashedPassword;
            
            await saveUsersAsync(users);
            
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Failed to change password' });
        }
    }
);

/**
 * Update email (untuk user yang sudah login)
 * - Authentication required
 * - Validasi email baru
 */
app.put('/api/auth/update-email',
    apiLimiter,
    authenticateUser,
    validateEmail(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const { email: newEmail }: { email: string } = req.body;
            
            const user = users.find(u => u.id === req.user!.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            // Check if new email already exists
            const existingUser = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== user.id);
            if (existingUser) {
                res.status(400).json({ message: 'Email already registered' });
                return;
            }
            
            // Update email
            user.email = newEmail.toLowerCase();
            
            await saveUsersAsync(users);
            
            // Generate new token dengan email baru
            const token = generateToken(user);
            
            res.json({
                message: 'Email updated successfully',
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        } catch (error) {
            console.error('Update email error:', error);
            res.status(500).json({ message: 'Failed to update email' });
        }
    }
);

// ============================================
// COURSE ROUTES
// ============================================

/**
 * Get all courses
 * - Public endpoint
 * - Rate limiting
 */
app.get('/api/courses', apiLimiter, (_req: Request, res: Response) => {
    console.log(`[API] GET /api/courses - Returning ${courses.length} courses`);
    res.json({ courses });
});

/**
 * Get course by ID
 * - Public endpoint
 * - Rate limiting
 */
app.get('/api/courses/:id', apiLimiter, (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
        res.status(400).json({ message: 'Invalid course ID' });
        return;
    }
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    res.json({ course });
});

/**
 * Create course (Admin only)
 * - Authentication required
 * - Admin role required
 * - Input validation
 */
app.post('/api/courses', 
    apiLimiter,
    authenticateUser,
    requireAdmin,
    ...validateCourseData(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const { title, description, category, duration }: CourseData = req.body;
            
            const newCourse: Course = {
                id: nextCourseId++,
                title,
                description,
                category,
                duration: parseInt(duration.toString()),
                createdAt: new Date().toISOString()
            };
            
            courses.push(newCourse);
            console.log(`[API] POST /api/courses - Course created: ${newCourse.title} (ID: ${newCourse.id})`);
            console.log(`[API] Total courses in memory: ${courses.length}`);
            await saveCoursesAsync(courses);
            console.log(`[API] Courses saved to file successfully`);
            await saveAllCounters();
            console.log(`[API] Counters saved successfully`);
            
            res.status(201).json({ message: 'Course created successfully', course: newCourse });
        } catch (error) {
            console.error('Create course error:', error);
            res.status(500).json({ message: 'Failed to create course' });
        }
    }
);

/**
 * Update course (Admin only)
 * - Authentication required
 * - Admin role required
 * - Input validation
 */
app.put('/api/courses/:id', 
    apiLimiter,
    authenticateUser,
    requireAdmin,
    ...validateCourseDataOptional(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ message: 'Invalid course ID' });
                return;
            }
            
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex === -1) {
                res.status(404).json({ message: 'Course not found' });
                return;
            }
            
            const { title, description, category, duration }: Partial<CourseData> = req.body;
            courses[courseIndex] = {
                ...courses[courseIndex],
                ...(title && { title }),
                ...(description && { description }),
                ...(category && { category }),
                ...(duration && { duration: parseInt(duration.toString()) })
            };
            
            await saveCoursesAsync(courses);
            res.json({ message: 'Course updated successfully', course: courses[courseIndex] });
        } catch (error) {
            console.error('Update course error:', error);
            res.status(500).json({ message: 'Failed to update course' });
        }
    }
);

/**
 * Delete course (Admin only)
 * - Authentication required
 * - Admin role required
 */
app.delete('/api/courses/:id', 
    apiLimiter,
    authenticateUser,
    requireAdmin,
    async (req: AuthRequest, res: Response) => {
        try {
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ message: 'Invalid course ID' });
                return;
            }
            
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex === -1) {
                res.status(404).json({ message: 'Course not found' });
                return;
            }
            
            courses.splice(courseIndex, 1);
            // Also remove enrollments and assignments for this course
            enrollments = enrollments.filter(e => e.courseId !== courseId);
            assignments = assignments.filter(a => a.courseId !== courseId);
            
            await saveCoursesAsync(courses);
            await saveEnrollmentsAsync(enrollments);
            await saveAssignmentsAsync(assignments);
            
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            console.error('Delete course error:', error);
            res.status(500).json({ message: 'Failed to delete course' });
        }
    }
);

// ============================================
// ENROLLMENT ROUTES
// ============================================

/**
 * Enroll in course (Student only)
 * - Authentication required
 * - Student role required
 */
app.post('/api/courses/:id/enroll', 
    apiLimiter,
    authenticateUser,
    requireStudent,
    async (req: AuthRequest, res: Response) => {
        try {
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ message: 'Invalid course ID' });
                return;
            }
            
            const course = courses.find(c => c.id === courseId);
            if (!course) {
                res.status(404).json({ message: 'Course not found' });
                return;
            }
            
            const existingEnrollment = enrollments.find(
                e => e.studentId === req.user!.id && e.courseId === courseId
            );
            
            if (existingEnrollment) {
                res.status(400).json({ message: 'Already enrolled in this course' });
                return;
            }
            
            enrollments.push({
                studentId: req.user!.id,
                courseId,
                enrolledAt: new Date().toISOString()
            });
            
            await saveEnrollmentsAsync(enrollments);
            res.json({ message: 'Enrolled successfully' });
        } catch (error) {
            console.error('Enroll error:', error);
            res.status(500).json({ message: 'Failed to enroll' });
        }
    }
);

// ============================================
// STUDENT ROUTES
// ============================================

/**
 * Get student courses
 * - Authentication required
 * - Student can only see their own courses (unless admin)
 */
app.get('/api/students/:id/courses', 
    apiLimiter,
    authenticateUser,
    async (req: AuthRequest, res: Response) => {
        try {
            const studentId = parseInt(req.params.id);
            if (isNaN(studentId)) {
                res.status(400).json({ message: 'Invalid student ID' });
                return;
            }
            
            if (req.user!.id !== studentId && req.user!.role !== 'admin') {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
            
            const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
            const studentCourses = studentEnrollments
                .map(enrollment => courses.find(c => c.id === enrollment.courseId))
                .filter((c): c is Course => c !== undefined);
            
            res.json({ courses: studentCourses });
        } catch (error) {
            console.error('Get student courses error:', error);
            res.status(500).json({ message: 'Failed to fetch courses' });
        }
    }
);

/**
 * Get student assignments
 * - Authentication required
 * - Student can only see their own assignments (unless admin)
 */
app.get('/api/students/:id/assignments', 
    apiLimiter,
    authenticateUser,
    async (req: AuthRequest, res: Response) => {
        try {
            const studentId = parseInt(req.params.id);
            if (isNaN(studentId)) {
                res.status(400).json({ message: 'Invalid student ID' });
                return;
            }
            
            if (req.user!.id !== studentId && req.user!.role !== 'admin') {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
            
            const studentAssignments = assignments
                .filter(a => a.studentId === studentId)
                .map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    return {
                        ...assignment,
                        courseTitle: course ? course.title : 'Unknown Course'
                    };
                });
            
            res.json({ assignments: studentAssignments });
        } catch (error) {
            console.error('Get student assignments error:', error);
            res.status(500).json({ message: 'Failed to fetch assignments' });
        }
    }
);

// ============================================
// ASSIGNMENT ROUTES
// ============================================

/**
 * Submit assignment (Student only)
 * - Authentication required
 * - Student role required
 * - Input validation
 */
app.post('/api/assignments', 
    apiLimiter,
    authenticateUser,
    requireStudent,
    ...validateAssignmentData(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const { courseId, title, content }: AssignmentData = req.body;
            
            // Check if student is enrolled
            const enrollment = enrollments.find(
                e => e.studentId === req.user!.id && e.courseId === courseId
            );
            
            if (!enrollment) {
                res.status(400).json({ message: 'You must be enrolled in this course' });
                return;
            }
            
            const newAssignment: Assignment = {
                id: nextAssignmentId++,
                studentId: req.user!.id,
                courseId: parseInt(courseId.toString()),
                title,
                content,
                status: 'submitted',
                submittedAt: new Date().toISOString()
            };
            
            assignments.push(newAssignment);
            await saveAssignmentsAsync(assignments);
            await saveAllCounters();
            
            res.status(201).json({ message: 'Assignment submitted successfully', assignment: newAssignment });
        } catch (error) {
            console.error('Submit assignment error:', error);
            res.status(500).json({ message: 'Failed to submit assignment' });
        }
    }
);

/**
 * Update assignment (Student only)
 * - Authentication required
 * - Student can only update their own assignments
 * - Cannot update graded assignments
 */
app.put('/api/assignments/:id', 
    apiLimiter,
    authenticateUser,
    requireStudent,
    body('title').optional().isLength({ min: 3, max: 200 }).trim().escape(),
    body('content').optional().isLength({ min: 10, max: 10000 }).trim(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const assignmentId = parseInt(req.params.id);
            if (isNaN(assignmentId)) {
                res.status(400).json({ message: 'Invalid assignment ID' });
                return;
            }
            
            const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
            if (assignmentIndex === -1) {
                res.status(404).json({ message: 'Assignment not found' });
                return;
            }
            
            const assignment = assignments[assignmentIndex];
            
            if (assignment.studentId !== req.user!.id) {
                res.status(403).json({ message: 'You can only update your own assignments' });
                return;
            }
            
            if (assignment.status === 'graded') {
                res.status(400).json({ message: 'Cannot update graded assignments' });
                return;
            }
            
            const { title, content }: Partial<AssignmentData> = req.body;
            assignments[assignmentIndex] = {
                ...assignments[assignmentIndex],
                ...(title && { title }),
                ...(content && { content }),
                status: 'submitted',
                submittedAt: new Date().toISOString()
            };
            
            await saveAssignmentsAsync(assignments);
            res.json({ message: 'Assignment updated successfully', assignment: assignments[assignmentIndex] });
        } catch (error) {
            console.error('Update assignment error:', error);
            res.status(500).json({ message: 'Failed to update assignment' });
        }
    }
);

/**
 * Get all assignments (Admin only)
 * - Authentication required
 * - Admin role required
 * - Returns all assignments with course and student info
 */
app.get('/api/assignments', 
    apiLimiter,
    authenticateUser,
    requireAdmin,
    async (_req: AuthRequest, res: Response) => {
        try {
            const assignmentsWithDetails = assignments.map(assignment => {
                const course = courses.find(c => c.id === assignment.courseId);
                const student = users.find(u => u.id === assignment.studentId);
                return {
                    ...assignment,
                    courseTitle: course ? course.title : 'Unknown Course',
                    studentName: student ? student.name : 'Unknown Student',
                    studentEmail: student ? student.email : 'Unknown Email'
                };
            });
            
            console.log('[API] GET /api/assignments - Returning', assignmentsWithDetails.length, 'assignments');
            res.json({ assignments: assignmentsWithDetails });
        } catch (error) {
            console.error('Get all assignments error:', error);
            res.status(500).json({ message: 'Failed to fetch assignments' });
        }
    }
);

/**
 * Get assignment by ID
 * - Authentication required
 * - Student can only see their own assignments (unless admin)
 */
app.get('/api/assignments/:id', 
    apiLimiter,
    authenticateUser,
    async (req: AuthRequest, res: Response) => {
        try {
            const assignmentId = parseInt(req.params.id);
            if (isNaN(assignmentId)) {
                res.status(400).json({ message: 'Invalid assignment ID' });
                return;
            }
            
            const assignment = assignments.find(a => a.id === assignmentId);
            if (!assignment) {
                res.status(404).json({ message: 'Assignment not found' });
                return;
            }
            
            if (assignment.studentId !== req.user!.id && req.user!.role !== 'admin') {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
            
            // Add course and student info for admin
            if (req.user!.role === 'admin') {
                const course = courses.find(c => c.id === assignment.courseId);
                const student = users.find(u => u.id === assignment.studentId);
                res.json({ 
                    assignment: {
                        ...assignment,
                        courseTitle: course ? course.title : 'Unknown Course',
                        studentName: student ? student.name : 'Unknown Student',
                        studentEmail: student ? student.email : 'Unknown Email'
                    }
                });
            } else {
                res.json({ assignment });
            }
        } catch (error) {
            console.error('Get assignment error:', error);
            res.status(500).json({ message: 'Failed to fetch assignment' });
        }
    }
);

/**
 * Grade assignment (Admin only)
 * - Authentication required
 * - Admin role required
 * - Can only grade submitted assignments
 * - Updates status to 'graded' and adds score/feedback
 */
app.put('/api/assignments/:id/grade', 
    apiLimiter,
    authenticateUser,
    requireAdmin,
    body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('feedback').optional().isLength({ min: 0, max: 2000 }).trim(),
    checkValidation,
    async (req: AuthRequest, res: Response) => {
        try {
            const assignmentId = parseInt(req.params.id);
            if (isNaN(assignmentId)) {
                res.status(400).json({ message: 'Invalid assignment ID' });
                return;
            }
            
            const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
            if (assignmentIndex === -1) {
                res.status(404).json({ message: 'Assignment not found' });
                return;
            }
            
            const assignment = assignments[assignmentIndex];
            
            if (assignment.status === 'graded') {
                res.status(400).json({ message: 'Assignment has already been graded' });
                return;
            }
            
            if (assignment.status !== 'submitted') {
                res.status(400).json({ message: 'Can only grade submitted assignments' });
                return;
            }
            
            const { score, feedback } = req.body;
            
            assignments[assignmentIndex] = {
                ...assignments[assignmentIndex],
                status: 'graded',
                score: parseInt(score),
                feedback: feedback || '',
                gradedAt: new Date().toISOString(),
                gradedBy: req.user!.id
            };
            
            await saveAssignmentsAsync(assignments);
            
            const course = courses.find(c => c.id === assignment.courseId);
            const student = users.find(u => u.id === assignment.studentId);
            
            console.log('[API] PUT /api/assignments/:id/grade - Assignment graded:', {
                assignmentId,
                courseTitle: course?.title,
                studentName: student?.name,
                score
            });
            
            res.json({ 
                message: 'Assignment graded successfully', 
                assignment: {
                    ...assignments[assignmentIndex],
                    courseTitle: course ? course.title : 'Unknown Course',
                    studentName: student ? student.name : 'Unknown Student',
                    studentEmail: student ? student.email : 'Unknown Email'
                }
            });
        } catch (error) {
            console.error('Grade assignment error:', error);
            res.status(500).json({ message: 'Failed to grade assignment' });
        }
    }
);

// ============================================
// STATIC FILES (must be after API routes)
// ============================================

// Static files - serve after API routes to avoid conflicts
// Add no-cache headers for JS files to prevent caching issues during development
app.use(express.static(path.join(__dirname, '../../../'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(safeErrorHandler);

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`💾 Data storage: File-based (persistent, async)`);
    console.log(`📁 Data files: ./data/`);
    console.log(`🔒 Security: Enabled (JWT, Rate Limiting, Input Validation)`);
});

// Handle server errors
server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
        console.error('To stop all Node.js processes, run: taskkill /F /IM node.exe');
        process.exit(1);
    } else {
        throw err;
    }
});

