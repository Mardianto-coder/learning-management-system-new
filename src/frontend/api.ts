/**
 * ============================================
 * API UTILITY FUNCTIONS - LMS Platform
 * ============================================
 * 
 * File ini berisi semua fungsi untuk berkomunikasi dengan API backend.
 * Semua fungsi menggunakan Fetch API (native browser API).
 * 
 * CARA MENGGUNAKAN:
 * 1. Import fungsi yang dibutuhkan
 * 2. Panggil fungsi dengan parameter yang sesuai
 * 3. Handle response dengan async/await atau .then()
 * 
 * CONTOH:
 * ```typescript
 * import { getAllCourses, loginUser } from './api.js';
 * 
 * // Menggunakan async/await
 * async function loadData() {
 *     const courses = await getAllCourses();
 *     console.log(courses);
 * }
 * 
 * // Menggunakan .then()
 * getAllCourses().then(courses => {
 *     console.log(courses);
 * });
 * ```
 */

import type { User, Course, Assignment, UserRole, CourseData, AssignmentData } from '../types/index.js';

// Base URL untuk semua API calls
const API_BASE: string = 'http://localhost:3000/api';

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Mendapatkan current user dari localStorage
 * @returns User object atau null jika belum login
 */
export function getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Menyimpan user ke localStorage setelah login
 * @param user - User object yang akan disimpan
 * @param token - JWT token (optional)
 */
export function saveCurrentUser(user: User, token?: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (token) {
        localStorage.setItem('authToken', token);
    }
}

/**
 * Mendapatkan JWT token dari localStorage
 * @returns JWT token atau null
 */
export function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

/**
 * Menghapus token dari localStorage
 */
export function clearAuthToken(): void {
    localStorage.removeItem('authToken');
}

/**
 * Menghapus user dari localStorage (logout)
 */
export function clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    clearAuthToken();
}

/**
 * Membuat header untuk request yang memerlukan authentication
 * Menggunakan JWT token dari localStorage
 * @returns Object dengan headers yang diperlukan
 */
function getAuthHeaders(): Record<string, string> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found. Please login again.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * ============================================
 * AUTHENTICATION API
 * ============================================
 */

/**
 * Register user baru
 * 
 * @param name - Nama lengkap user
 * @param email - Email user
 * @param password - Password user
 * @param role - Role user ('student' atau 'admin')
 * @returns Promise<User> - User object yang baru dibuat
 * 
 * @example
 * ```typescript
 * // CATATAN: 'TEST_Password123' adalah contoh untuk dokumentasi, bukan password real
 * const user = await registerUser('John Doe', 'john@example.com', 'TEST_Password123', 'student');
 * console.log('User ID:', user.id);
 * ```
 */
export async function registerUser(
    name: string,
    email: string,
    password: string,
    role: UserRole
): Promise<User> {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, try to get text and parse
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text || 'Registration failed');
            }
        }

        if (!response.ok) {
            // Handle validation errors
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const errorMessages = data.errors.map((err: any) => err.message).join(', ');
                throw new Error(errorMessages || data.message || 'Registration failed');
            }
            throw new Error(data.message || data.error || 'Registration failed');
        }

        // Simpan token jika ada
        if (data.token) {
            saveCurrentUser(data.user, data.token);
        }

        return data.user;
    } catch (error: any) {
        console.error('Register error:', error);
        // If error is already an Error object, throw it
        if (error instanceof Error) {
            throw error;
        }
        // Otherwise, wrap it
        throw new Error(error.message || 'Registration failed');
    }
}

/**
 * Login user
 * 
 * @param email - Email user
 * @param password - Password user
 * @param role - Role user ('student' atau 'admin')
 * @returns Promise<User> - User object yang berhasil login
 * 
 * @example
 * ```typescript
 * // CATATAN: 'TEST_Password123' adalah contoh untuk dokumentasi, bukan password real
 * const user = await loginUser('john@example.com', 'TEST_Password123', 'student');
 * saveCurrentUser(user); // Simpan ke localStorage
 * ```
 */
export async function loginUser(
    email: string,
    password: string,
    role: UserRole
): Promise<User> {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        });

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, try to get text and parse
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text || 'Login failed');
            }
        }

        if (!response.ok) {
            // Handle validation errors
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const errorMessages = data.errors.map((err: any) => err.message).join(', ');
                throw new Error(errorMessages || data.message || 'Login failed');
            }
            throw new Error(data.message || data.error || 'Login failed');
        }

        // Simpan token jika ada
        if (data.token) {
            saveCurrentUser(data.user, data.token);
        }

        return data.user;
    } catch (error: any) {
        console.error('Login error:', error);
        // If error is already an Error object, throw it
        if (error instanceof Error) {
            throw error;
        }
        // Otherwise, wrap it
        throw new Error(error.message || 'Login failed');
    }
}

/**
 * Reset password dengan email
 * 
 * @param email - Email user yang ingin reset password
 * @returns Promise<void>
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text || 'Password reset failed');
            }
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Password reset failed');
        }
    } catch (error: any) {
        console.error('Reset password error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(error.message || 'Password reset failed');
    }
}

/**
 * Change password (untuk user yang sudah login)
 * 
 * @param currentPassword - Password saat ini
 * @param newPassword - Password baru
 * @returns Promise<void>
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword, password: newPassword })
        });

        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text || 'Change password failed');
            }
        }

        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const errorMessages = data.errors.map((err: any) => err.message).join(', ');
                throw new Error(errorMessages || data.message || 'Change password failed');
            }
            throw new Error(data.message || data.error || 'Change password failed');
        }
    } catch (error: any) {
        console.error('Change password error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(error.message || 'Change password failed');
    }
}

/**
 * Update email (untuk user yang sudah login)
 * 
 * @param newEmail - Email baru
 * @returns Promise<User>
 */
export async function updateEmail(newEmail: string): Promise<User> {
    try {
        const response = await fetch(`${API_BASE}/auth/update-email`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email: newEmail })
        });

        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text || 'Update email failed');
            }
        }

        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const errorMessages = data.errors.map((err: any) => err.message).join(', ');
                throw new Error(errorMessages || data.message || 'Update email failed');
            }
            throw new Error(data.message || data.error || 'Update email failed');
        }

        // Update token jika ada
        if (data.token) {
            saveCurrentUser(data.user, data.token);
        }

        return data.user;
    } catch (error: any) {
        console.error('Update email error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(error.message || 'Update email failed');
    }
}

/**
 * ============================================
 * COURSES API
 * ============================================
 */

/**
 * Mendapatkan semua courses yang tersedia
 * 
 * @returns Promise<Course[]> - Array of courses
 * 
 * @example
 * ```typescript
 * const courses = await getAllCourses();
 * courses.forEach(course => {
 *     console.log(course.title);
 * });
 * ```
 */
export async function getAllCourses(): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch courses');
        }

        return data.courses || [];
    } catch (error) {
        console.error('Error loading courses:', error);
        throw error;
    }
}

/**
 * Mendapatkan course berdasarkan ID
 * 
 * @param courseId - ID course yang ingin diambil
 * @returns Promise<Course> - Course object
 * 
 * @example
 * ```typescript
 * const course = await getCourseById(1);
 * console.log('Course title:', course.title);
 * ```
 */
export async function getCourseById(courseId: number): Promise<Course> {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Course not found');
        }

        return data.course;
    } catch (error) {
        console.error('Error loading course:', error);
        throw error;
    }
}

/**
 * Membuat course baru (Admin only)
 * 
 * @param courseData - Data course yang akan dibuat
 * @param userId - ID admin yang membuat course
 * @returns Promise<Course> - Course object yang baru dibuat
 * 
 * @example
 * ```typescript
 * const course = await createCourse({
 *     title: 'New Course',
 *     description: 'Course description',
 *     category: 'programming',
 *     duration: 40
 * }, adminUserId);
 * ```
 */
export async function createCourse(
    courseData: CourseData
): Promise<Course> {
    try {
        const response = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create course');
        }

        return data.course;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
}

/**
 * Update course yang sudah ada (Admin only)
 * 
 * @param courseId - ID course yang akan diupdate
 * @param courseData - Data course yang akan diupdate
 * @param userId - ID admin yang mengupdate
 * @returns Promise<Course> - Course object yang sudah diupdate
 * 
 * @example
 * ```typescript
 * const updatedCourse = await updateCourse(1, {
 *     title: 'Updated Title',
 *     description: 'Updated description',
 *     category: 'programming',
 *     duration: 50
 * }, adminUserId);
 * ```
 */
export async function updateCourse(
    courseId: number,
    courseData: Partial<CourseData>
): Promise<Course> {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update course');
        }

        return data.course;
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Menghapus course (Admin only)
 * 
 * @param courseId - ID course yang akan dihapus
 * @param userId - ID admin yang menghapus
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await deleteCourse(1, adminUserId);
 * console.log('Course deleted successfully');
 * ```
 */
export async function deleteCourse(
    courseId: number
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete course');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
}

/**
 * ============================================
 * ENROLLMENT API
 * ============================================
 */

/**
 * Enroll student ke dalam course
 * 
 * @param courseId - ID course yang akan di-enroll
 * @param userId - ID student yang akan enroll
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await enrollInCourse(1, studentUserId);
 * console.log('Successfully enrolled!');
 * ```
 */
export async function enrollInCourse(
    courseId: number
): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to enroll');
        }
    } catch (error) {
        console.error('Error enrolling:', error);
        throw error;
    }
}

/**
 * ============================================
 * STUDENT API
 * ============================================
 */

/**
 * Mendapatkan semua courses yang di-enroll oleh student
 * 
 * @param studentId - ID student
 * @returns Promise<Course[]> - Array of enrolled courses
 * 
 * @example
 * ```typescript
 * const enrolledCourses = await getStudentCourses(studentId);
 * console.log('Total enrolled:', enrolledCourses.length);
 * ```
 */
export async function getStudentCourses(studentId: number): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}/courses`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch student courses');
        }

        return data.courses || [];
    } catch (error) {
        console.error('Error loading student courses:', error);
        throw error;
    }
}

/**
 * Mendapatkan semua assignments milik student
 * 
 * @param studentId - ID student
 * @returns Promise<Assignment[]> - Array of assignments
 * 
 * @example
 * ```typescript
 * const assignments = await getStudentAssignments(studentId);
 * assignments.forEach(assignment => {
 *     console.log(assignment.title, '-', assignment.status);
 * });
 * ```
 */
export async function getStudentAssignments(studentId: number): Promise<Assignment[]> {
    try {
        console.log('[API] getStudentAssignments: Fetching assignments for studentId:', studentId);
        const response = await fetch(`${API_BASE}/students/${studentId}/assignments`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        console.log('[API] getStudentAssignments: Response data:', data);

        if (!response.ok) {
            console.error('[API] getStudentAssignments: Error response:', data);
            throw new Error(data.message || 'Failed to fetch assignments');
        }

        const assignments = data.assignments || [];
        console.log('[API] getStudentAssignments: Returning assignments:', assignments.length, assignments);
        return assignments;
    } catch (error) {
        console.error('[API] Error loading assignments:', error);
        throw error;
    }
}

/**
 * ============================================
 * ASSIGNMENT API
 * ============================================
 */

/**
 * Submit assignment baru
 * 
 * @param assignmentData - Data assignment yang akan di-submit
 * @param userId - ID student yang submit
 * @returns Promise<Assignment> - Assignment object yang baru dibuat
 * 
 * @example
 * ```typescript
 * const assignment = await submitAssignment({
 *     courseId: 1,
 *     title: 'Assignment 1',
 *     content: 'Assignment content here...'
 * }, studentUserId);
 * console.log('Assignment ID:', assignment.id);
 * ```
 */
export async function submitAssignment(
    assignmentData: AssignmentData
): Promise<Assignment> {
    try {
        const response = await fetch(`${API_BASE}/assignments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(assignmentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit assignment');
        }

        return data.assignment;
    } catch (error) {
        console.error('Error submitting assignment:', error);
        throw error;
    }
}

/**
 * Update assignment yang sudah ada (hanya jika belum di-grade)
 * 
 * @param assignmentId - ID assignment yang akan diupdate
 * @param assignmentData - Data assignment yang akan diupdate
 * @param userId - ID student yang mengupdate
 * @returns Promise<Assignment> - Assignment object yang sudah diupdate
 * 
 * @example
 * ```typescript
 * const updated = await updateAssignment(1, {
 *     title: 'Updated Title',
 *     content: 'Updated content...'
 * }, studentUserId);
 * ```
 */
export async function updateAssignment(
    assignmentId: number,
    assignmentData: Partial<AssignmentData>
): Promise<Assignment> {
    try {
        const response = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(assignmentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update assignment');
        }

        return data.assignment;
    } catch (error) {
        console.error('Error updating assignment:', error);
        throw error;
    }
}

/**
 * Mendapatkan assignment berdasarkan ID
 * 
 * @param assignmentId - ID assignment
 * @param userId - ID user yang meminta (student atau admin)
 * @returns Promise<Assignment> - Assignment object
 * 
 * @example
 * ```typescript
 * const assignment = await getAssignmentById(1, userId);
 * console.log('Assignment:', assignment);
 * ```
 */
export async function getAssignmentById(
    assignmentId: number
): Promise<Assignment> {
    try {
        const response = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Assignment not found');
        }

        return data.assignment;
    } catch (error) {
        console.error('Error loading assignment:', error);
        throw error;
    }
}

/**
 * Mendapatkan semua assignments (Admin only)
 * 
 * @returns Promise<Assignment[]> - Array of all assignments
 * 
 * @example
 * ```typescript
 * const allAssignments = await getAllAssignments();
 * console.log('All assignments:', allAssignments);
 * ```
 */
export async function getAllAssignments(): Promise<Assignment[]> {
    try {
        const response = await fetch(`${API_BASE}/assignments`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch assignments');
        }

        return data.assignments || [];
    } catch (error) {
        console.error('Error loading all assignments:', error);
        throw error;
    }
}

/**
 * Grade assignment (Admin only)
 * 
 * @param assignmentId - ID assignment yang akan di-grade
 * @param score - Score dari 0-100
 * @param feedback - Feedback untuk student (optional)
 * @returns Promise<Assignment> - Assignment object yang sudah di-grade
 * 
 * @example
 * ```typescript
 * const graded = await gradeAssignment(1, 85, 'Good work!');
 * console.log('Graded assignment:', graded);
 * ```
 */
export async function gradeAssignment(
    assignmentId: number,
    score: number,
    feedback?: string
): Promise<Assignment> {
    try {
        const response = await fetch(`${API_BASE}/assignments/${assignmentId}/grade`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ score, feedback: feedback || '' })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to grade assignment');
        }

        return data.assignment;
    } catch (error) {
        console.error('Error grading assignment:', error);
        throw error;
    }
}

/**
 * ============================================
 * CONVENIENCE FUNCTIONS
 * ============================================
 * Fungsi-fungsi helper yang menggunakan currentUser dari localStorage
 */

/**
 * Mendapatkan enrolled courses untuk current user
 * Menggunakan currentUser dari localStorage
 * 
 * @returns Promise<Course[]> - Array of enrolled courses
 * 
 * @example
 * ```typescript
 * const myCourses = await getMyCourses();
 * ```
 */
export async function getMyCourses(): Promise<Course[]> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not logged in');
    }
    return getStudentCourses(user.id);
}

/**
 * Mendapatkan assignments untuk current user
 * Menggunakan currentUser dari localStorage
 * 
 * @returns Promise<Assignment[]> - Array of assignments
 * 
 * @example
 * ```typescript
 * const myAssignments = await getMyAssignments();
 * ```
 */
export async function getMyAssignments(): Promise<Assignment[]> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not logged in');
    }
    return getStudentAssignments(user.id);
}

/**
 * Enroll current user ke dalam course
 * Menggunakan currentUser dari localStorage
 * 
 * @param courseId - ID course yang akan di-enroll
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await enrollMeInCourse(1);
 * ```
 */
export async function enrollMeInCourse(courseId: number): Promise<void> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not logged in');
    }
    return enrollInCourse(courseId);
}

