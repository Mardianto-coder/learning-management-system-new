// Type Definitions for LMS Application

export type UserRole = 'student' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    createdAt?: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    category: 'programming' | 'design' | 'business' | 'language';
    duration: number;
    createdAt?: string;
}

export interface Enrollment {
    studentId: number;
    courseId: number;
    enrolledAt: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export interface Assignment {
    id: number;
    studentId: number;
    courseId: number;
    title: string;
    content: string;
    status: AssignmentStatus;
    submittedAt: string;
    courseTitle?: string;
    score?: number; // Score dari 0-100 (hanya untuk graded assignments)
    feedback?: string; // Feedback dari admin (hanya untuk graded assignments)
    gradedAt?: string; // Tanggal kapan assignment di-grade
    gradedBy?: number; // ID admin yang melakukan grading
}

export interface ApiResponse {
    message?: string;
    [key: string]: any;
}

export interface LoginRequest {
    email: string;
    password: string;
    role: UserRole;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface CourseData {
    title: string;
    description: string;
    category: Course['category'];
    duration: number;
}

export interface AssignmentData {
    courseId: number;
    title: string;
    content: string;
    studentId?: number;
}
