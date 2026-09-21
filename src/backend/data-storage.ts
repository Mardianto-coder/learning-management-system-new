/**
 * File-based Data Storage
 * 
 * Menyimpan data ke file JSON agar data persisten (tidak hilang saat server restart)
 */

import fs from 'fs';
import path from 'path';
import { User, Course, Enrollment, Assignment } from '../types/index';

// File server ada di dist/backend/backend/, jadi perlu naik 3 level ke root
const DATA_DIR = path.join(__dirname, '../../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions untuk read/write file
function readJSONFile<T>(filePath: string, defaultValue: T): T {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return defaultValue;
}

function writeJSONFile<T>(filePath: string, data: T): void {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
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

// Load data dari file
export function loadData() {
    const users = readJSONFile<User[]>(USERS_FILE, []);
    
    // Load courses - jika file tidak ada, gunakan default, lalu simpan default ke file
    let courses: Course[];
    if (fs.existsSync(COURSES_FILE)) {
        courses = readJSONFile<Course[]>(COURSES_FILE, []);
    } else {
        // File belum ada, gunakan default dan simpan ke file
        courses = DEFAULT_COURSES;
        writeJSONFile(COURSES_FILE, courses);
        console.log('📝 Created courses.json with default data');
    }
    
    const enrollments = readJSONFile<Enrollment[]>(ENROLLMENTS_FILE, []);
    const assignments = readJSONFile<Assignment[]>(ASSIGNMENTS_FILE, []);
    
    const counters = readJSONFile<{ nextUserId: number; nextCourseId: number; nextAssignmentId: number }>(
        COUNTERS_FILE,
        { nextUserId: 1, nextCourseId: 5, nextAssignmentId: 1 }
    );

    console.log(`📊 Loaded: ${users.length} users, ${courses.length} courses, ${enrollments.length} enrollments, ${assignments.length} assignments`);
    
    return { users, courses, enrollments, assignments, counters };
}

// Save data ke file
export function saveUsers(users: User[]): void {
    writeJSONFile(USERS_FILE, users);
}

export function saveCourses(courses: Course[]): void {
    writeJSONFile(COURSES_FILE, courses);
}

export function saveEnrollments(enrollments: Enrollment[]): void {
    writeJSONFile(ENROLLMENTS_FILE, enrollments);
}

export function saveAssignments(assignments: Assignment[]): void {
    writeJSONFile(ASSIGNMENTS_FILE, assignments);
}

export function saveCounters(counters: { nextUserId: number; nextCourseId: number; nextAssignmentId: number }): void {
    writeJSONFile(COUNTERS_FILE, counters);
}

