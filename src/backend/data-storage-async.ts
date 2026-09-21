/**
 * File-based Data Storage (Async Version)
 * 
 * Versi async untuk performa lebih baik - tidak blocking event loop
 */

import fs from 'fs/promises';
import path from 'path';
import { User, Course, Enrollment, Assignment } from '../types/index';

// File server ada di dist/backend/backend/, jadi perlu naik 3 level ke root
const DATA_DIR = path.join(__dirname, '../../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

// Pastikan folder data ada (async)
async function ensureDataDir(): Promise<void> {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Initialize data directory
ensureDataDir().catch(console.error);

// Helper functions untuk read/write file (async)
async function readJSONFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // File tidak ada atau error, return default
        return defaultValue;
    }
}

async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        throw error;
    }
}

// Default courses (hanya digunakan jika file belum ada)
const DEFAULT_COURSES: Course[] = [
    {
        id: 1,
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
        category: 'programming',
        duration: 40,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: 'UI/UX Design Principles',
        description: 'Master the art of creating beautiful and user-friendly interfaces.',
        category: 'design',
        duration: 30,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        title: 'Business Management Fundamentals',
        description: 'Essential skills for managing teams and projects effectively.',
        category: 'business',
        duration: 35,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        title: 'English for Professionals',
        description: 'Improve your English communication skills for the workplace.',
        category: 'language',
        duration: 50,
        createdAt: new Date().toISOString()
    }
];

// Load data dari file (async)
export async function loadDataAsync() {
    await ensureDataDir();
    
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    
    // Load courses - jika file tidak ada, gunakan default, lalu simpan default ke file
    let courses: Course[];
    try {
        await fs.access(COURSES_FILE);
        courses = await readJSONFile<Course[]>(COURSES_FILE, []);
    } catch {
        // File belum ada, gunakan default dan simpan ke file
        courses = DEFAULT_COURSES;
        await writeJSONFile(COURSES_FILE, courses);
        console.log('📝 Created courses.json with default data');
    }
    
    const enrollments = await readJSONFile<Enrollment[]>(ENROLLMENTS_FILE, []);
    const assignments = await readJSONFile<Assignment[]>(ASSIGNMENTS_FILE, []);
    
    const counters = await readJSONFile<{ nextUserId: number; nextCourseId: number; nextAssignmentId: number }>(
        COUNTERS_FILE,
        { nextUserId: 1, nextCourseId: 5, nextAssignmentId: 1 }
    );

    console.log(`📊 Loaded: ${users.length} users, ${courses.length} courses, ${enrollments.length} enrollments, ${assignments.length} assignments`);
    
    return { users, courses, enrollments, assignments, counters };
}

// Save data ke file (async)
export async function saveUsersAsync(users: User[]): Promise<void> {
    await writeJSONFile(USERS_FILE, users);
}

export async function saveCoursesAsync(courses: Course[]): Promise<void> {
    await writeJSONFile(COURSES_FILE, courses);
}

export async function saveEnrollmentsAsync(enrollments: Enrollment[]): Promise<void> {
    await writeJSONFile(ENROLLMENTS_FILE, enrollments);
}

export async function saveAssignmentsAsync(assignments: Assignment[]): Promise<void> {
    await writeJSONFile(ASSIGNMENTS_FILE, assignments);
}

export async function saveCountersAsync(counters: { nextUserId: number; nextCourseId: number; nextAssignmentId: number }): Promise<void> {
    await writeJSONFile(COUNTERS_FILE, counters);
}

