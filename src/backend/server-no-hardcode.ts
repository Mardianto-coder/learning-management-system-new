/**
 * CONTOH: Server tanpa hardcode courses
 * 
 * File ini menunjukkan cara menghapus hardcode dan menggunakan data dari API
 * Copy isi file ini ke server.ts untuk menghapus hardcode
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { User, Course, Enrollment, Assignment, UserRole, CourseData, AssignmentData } from '../types/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../')));

// Extend Express Request to include user
interface AuthRequest extends Request {
    user?: User;
}

// ============================================
// IN-MEMORY DATABASE (TANPA HARDCODE)
// ============================================
// Data kosong, semua data ditambah via API
let users: User[] = [];
let courses: Course[] = []; // KOSONG - tidak hardcode!
let enrollments: Enrollment[] = [];
let assignments: Assignment[] = [];

let nextUserId = 1;
let nextCourseId = 1; // Mulai dari 1, bukan 5
let nextAssignmentId = 1;

// ============================================
// OPSIONAL: Seed Data Awal (Jika Perlu)
// ============================================
// Uncomment fungsi di bawah jika ingin data awal untuk testing
/*
function seedInitialData() {
    // Hanya seed jika data kosong
    if (courses.length === 0) {
        courses.push(
            {
                id: nextCourseId++,
                title: 'Introduction to Web Development',
                description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
                category: 'programming',
                duration: 40,
                createdAt: new Date().toISOString()
            },
            {
                id: nextCourseId++,
                title: 'UI/UX Design Principles',
                description: 'Master the art of creating beautiful and user-friendly interfaces.',
                category: 'design',
                duration: 30,
                createdAt: new Date().toISOString()
            }
        );
        console.log('✅ Initial data seeded');
    }
}

// Panggil saat server start (opsional)
// seedInitialData();
*/

// Helper function to authenticate user
function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    
    const userId = parseInt(authHeader.replace('Bearer ', ''));
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        res.status(401).json({ message: 'Invalid authentication' });
        return;
    }
    
    req.user = user;
    next();
}

// Helper function to check admin role
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
}

// Routes
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Authentication Routes
app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, role }: { name?: string; email?: string; password?: string; role?: UserRole } = req.body;
    
    if (!name || !email || !password || !role) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    
    if (users.find(u => u.email === email)) {
        res.status(400).json({ message: 'Email already registered' });
        return;
    }
    
    if (!['student', 'admin'].includes(role)) {
        res.status(400).json({ message: 'Invalid role' });
        return;
    }
    
    const newUser: User = {
        id: nextUserId++,
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.status(201).json({
        message: 'User registered successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role }: { email?: string; password?: string; role?: UserRole } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }
    
    if (user.role !== role) {
        res.status(401).json({ message: 'Role mismatch' });
        return;
    }
    
    res.json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

// Course Routes
app.get('/api/courses', (_req: Request, res: Response) => {
    res.json({ courses });
});

app.get('/api/courses/:id', (req: Request, res: Response) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    res.json({ course });
});

app.post('/api/courses', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, description, category, duration }: CourseData = req.body;
    
    if (!title || !description || !category || !duration) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    
    const newCourse: Course = {
        id: nextCourseId++,
        title,
        description,
        category,
        duration: parseInt(duration.toString()),
        createdAt: new Date().toISOString()
    };
    
    courses.push(newCourse);
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
});

app.put('/api/courses/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
    const courseId = parseInt(req.params.id);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    
    const { title, description, category, duration }: Partial<CourseData> = req.body;
    courses[courseIndex] = {
        ...courses[courseIndex],
        title: title || courses[courseIndex].title,
        description: description || courses[courseIndex].description,
        category: category || courses[courseIndex].category,
        duration: duration ? parseInt(duration.toString()) : courses[courseIndex].duration
    };
    
    res.json({ message: 'Course updated successfully', course: courses[courseIndex] });
});

app.delete('/api/courses/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
    const courseId = parseInt(req.params.id);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    
    courses.splice(courseIndex, 1);
    enrollments = enrollments.filter(e => e.courseId !== courseId);
    assignments = assignments.filter(a => a.courseId !== courseId);
    
    res.json({ message: 'Course deleted successfully' });
});

// Enrollment Routes
app.post('/api/courses/:id/enroll', authenticateUser, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'student') {
        res.status(403).json({ message: 'Only students can enroll' });
        return;
    }
    
    const courseId = parseInt(req.params.id);
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
        studentId: req.user.id,
        courseId,
        enrolledAt: new Date().toISOString()
    });
    
    res.json({ message: 'Enrolled successfully' });
});

// Student Routes
app.get('/api/students/:id/courses', authenticateUser, (req: AuthRequest, res: Response) => {
    if (req.user!.id !== parseInt(req.params.id) && req.user!.role !== 'admin') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    const studentEnrollments = enrollments.filter(e => e.studentId === parseInt(req.params.id));
    const studentCourses = studentEnrollments.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return course;
    }).filter((c): c is Course => c !== undefined);
    
    res.json({ courses: studentCourses });
});

app.get('/api/students/:id/assignments', authenticateUser, (req: AuthRequest, res: Response) => {
    if (req.user!.id !== parseInt(req.params.id) && req.user!.role !== 'admin') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    const studentAssignments = assignments
        .filter(a => a.studentId === parseInt(req.params.id))
        .map(assignment => {
            const course = courses.find(c => c.id === assignment.courseId);
            return {
                ...assignment,
                courseTitle: course ? course.title : 'Unknown Course'
            };
        });
    
    res.json({ assignments: studentAssignments });
});

// Assignment Routes
app.post('/api/assignments', authenticateUser, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'student') {
        res.status(403).json({ message: 'Only students can submit assignments' });
        return;
    }
    
    const { courseId, title, content }: AssignmentData = req.body;
    
    if (!courseId || !title || !content) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    
    const enrollment = enrollments.find(
        e => e.studentId === req.user!.id && e.courseId === courseId
    );
    
    if (!enrollment) {
        res.status(400).json({ message: 'You must be enrolled in this course' });
        return;
    }
    
    const newAssignment: Assignment = {
        id: nextAssignmentId++,
        studentId: req.user.id,
        courseId: parseInt(courseId.toString()),
        title,
        content,
        status: 'submitted',
        submittedAt: new Date().toISOString()
    };
    
    assignments.push(newAssignment);
    res.status(201).json({ message: 'Assignment submitted successfully', assignment: newAssignment });
});

app.put('/api/assignments/:id', authenticateUser, (req: AuthRequest, res: Response) => {
    const assignmentId = parseInt(req.params.id);
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
        title: title || assignments[assignmentIndex].title,
        content: content || assignments[assignmentIndex].content,
        status: 'submitted',
        submittedAt: new Date().toISOString()
    };
    
    res.json({ message: 'Assignment updated successfully', assignment: assignments[assignmentIndex] });
});

app.get('/api/assignments/:id', authenticateUser, (req: AuthRequest, res: Response) => {
    const assignment = assignments.find(a => a.id === parseInt(req.params.id));
    
    if (!assignment) {
        res.status(404).json({ message: 'Assignment not found' });
        return;
    }
    
    if (assignment.studentId !== req.user!.id && req.user!.role !== 'admin') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    res.json({ assignment });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`📝 Courses: ${courses.length} (Data ditambah via API, tidak hardcode)`);
});

// Handle server errors
server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
        console.error('To stop all Node.js processes, run: taskkill /F /IM node.exe');
        process.exit(1);
    } else {
        throw err;
    }
});

