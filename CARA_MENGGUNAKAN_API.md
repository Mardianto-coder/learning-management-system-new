# 📚 Cara Menggunakan API di Kodingan

File `src/frontend/api.ts` berisi semua fungsi untuk berkomunikasi dengan API backend. Semua fungsi sudah terorganisir dengan baik dan siap digunakan.

---

## 📁 Struktur File

```
src/frontend/
├── api.ts          ← Semua fungsi API (BARU!)
├── app.ts          ← Aplikasi utama (menggunakan api.ts)
└── ...
```

---

## 🚀 Cara Menggunakan

### 1. **Import Fungsi yang Diperlukan**

Di file TypeScript/JavaScript Anda, import fungsi yang dibutuhkan:

```typescript
// Import fungsi spesifik
import { getAllCourses, loginUser, enrollInCourse } from './api.js';

// Atau import semua
import * as API from './api.js';
```

---

### 2. **Menggunakan Fungsi API**

#### A. **Menggunakan async/await** (Recommended)

```typescript
async function loadCourses() {
    try {
        // Mengambil semua courses
        const courses = await getAllCourses();
        console.log('Total courses:', courses.length);
        
        // Menampilkan courses
        courses.forEach(course => {
            console.log(`${course.id}. ${course.title}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

#### B. **Menggunakan .then()**

```typescript
getAllCourses()
    .then(courses => {
        console.log('Courses loaded:', courses);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

---

## 📝 Contoh-contoh Penggunaan

### **1. Authentication**

#### Register User Baru

```typescript
import { registerUser, saveCurrentUser } from './api.js';

async function handleRegister() {
    try {
        const user = await registerUser(
            'John Doe',              // name
            'john@example.com',      // email
            'password123',           // password
            'student'                // role: 'student' atau 'admin'
        );
        
        console.log('User registered:', user);
        // User sudah terdaftar, tapi belum login
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
}
```

#### Login User

```typescript
import { loginUser, saveCurrentUser } from './api.js';

async function handleLogin() {
    try {
        const user = await loginUser(
            'john@example.com',     // email
            'password123',           // password
            'student'                // role
        );
        
        // Simpan user ke localStorage
        saveCurrentUser(user);
        console.log('Login successful! User ID:', user.id);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}
```

#### Check Current User

```typescript
import { getCurrentUser } from './api.js';

function checkUser() {
    const user = getCurrentUser();
    
    if (user) {
        console.log('User logged in:', user.name);
        console.log('User role:', user.role);
    } else {
        console.log('No user logged in');
    }
}
```

#### Logout

```typescript
import { clearCurrentUser } from './api.js';

function handleLogout() {
    clearCurrentUser();
    console.log('Logged out successfully');
}
```

---

### **2. Courses**

#### Get All Courses

```typescript
import { getAllCourses } from './api.js';

async function loadAllCourses() {
    try {
        const courses = await getAllCourses();
        
        // Tampilkan di UI
        courses.forEach(course => {
            console.log(`${course.title} - ${course.category}`);
        });
        
        return courses;
    } catch (error) {
        console.error('Failed to load courses:', error);
        // Fallback ke data lokal jika perlu
    }
}
```

#### Get Course by ID

```typescript
import { getCourseById } from './api.js';

async function showCourseDetails(courseId: number) {
    try {
        const course = await getCourseById(courseId);
        console.log('Course details:', course);
        return course;
    } catch (error) {
        console.error('Course not found:', error);
    }
}

// Penggunaan
showCourseDetails(1);
```

#### Create Course (Admin Only)

```typescript
import { createCourse, getCurrentUser } from './api.js';

async function addNewCourse() {
    const user = getCurrentUser();
    
    if (!user || user.role !== 'admin') {
        alert('Only admin can create courses');
        return;
    }
    
    try {
        const newCourse = await createCourse(
            {
                title: 'New Course Title',
                description: 'Course description here...',
                category: 'programming',  // 'programming', 'design', 'business', 'language'
                duration: 40
            },
            user.id
        );
        
        console.log('Course created:', newCourse);
        alert('Course created successfully!');
    } catch (error) {
        console.error('Failed to create course:', error);
        alert('Failed to create course: ' + error.message);
    }
}
```

#### Update Course (Admin Only)

```typescript
import { updateCourse, getCurrentUser } from './api.js';

async function editCourse(courseId: number) {
    const user = getCurrentUser();
    
    if (!user || user.role !== 'admin') {
        alert('Only admin can update courses');
        return;
    }
    
    try {
        const updated = await updateCourse(
            courseId,
            {
                title: 'Updated Title',
                description: 'Updated description',
                duration: 50
            },
            user.id
        );
        
        console.log('Course updated:', updated);
    } catch (error) {
        console.error('Failed to update:', error);
    }
}
```

#### Delete Course (Admin Only)

```typescript
import { deleteCourse, getCurrentUser } from './api.js';

async function removeCourse(courseId: number) {
    const user = getCurrentUser();
    
    if (!user || user.role !== 'admin') {
        alert('Only admin can delete courses');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }
    
    try {
        await deleteCourse(courseId, user.id);
        console.log('Course deleted successfully');
        alert('Course deleted!');
    } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete: ' + error.message);
    }
}
```

---

### **3. Enrollment (Student)**

#### Enroll in Course

```typescript
import { enrollInCourse, getCurrentUser } from './api.js';

async function handleEnroll(courseId: number) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Please login first');
        return;
    }
    
    if (user.role !== 'student') {
        alert('Only students can enroll');
        return;
    }
    
    try {
        await enrollInCourse(courseId, user.id);
        alert('Successfully enrolled!');
        // Refresh data setelah enroll
        loadMyCourses();
    } catch (error) {
        console.error('Enrollment failed:', error);
        alert('Failed to enroll: ' + error.message);
    }
}
```

#### Menggunakan Convenience Function

```typescript
import { enrollMeInCourse } from './api.js';

// Lebih mudah! Tidak perlu pass userId
async function enroll(courseId: number) {
    try {
        await enrollMeInCourse(courseId);
        console.log('Enrolled successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

### **4. Student Data**

#### Get Enrolled Courses

```typescript
import { getStudentCourses, getCurrentUser } from './api.js';

async function loadMyCourses() {
    const user = getCurrentUser();
    
    if (!user) {
        console.log('Please login first');
        return;
    }
    
    try {
        const courses = await getStudentCourses(user.id);
        console.log('My enrolled courses:', courses);
        return courses;
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// Atau menggunakan convenience function
import { getMyCourses } from './api.js';

async function loadCourses() {
    try {
        const courses = await getMyCourses(); // Otomatis pakai currentUser
        return courses;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### Get Student Assignments

```typescript
import { getMyAssignments } from './api.js';

async function loadMyAssignments() {
    try {
        const assignments = await getMyAssignments();
        
        assignments.forEach(assignment => {
            console.log(`${assignment.title} - Status: ${assignment.status}`);
        });
        
        return assignments;
    } catch (error) {
        console.error('Failed to load assignments:', error);
    }
}
```

---

### **5. Assignments**

#### Submit Assignment

```typescript
import { submitAssignment, getCurrentUser } from './api.js';

async function handleSubmitAssignment() {
    const user = getCurrentUser();
    
    if (!user || user.role !== 'student') {
        alert('Only students can submit assignments');
        return;
    }
    
    try {
        const assignment = await submitAssignment(
            {
                courseId: 1,
                title: 'Assignment 1',
                content: 'This is my assignment content...'
            },
            user.id
        );
        
        console.log('Assignment submitted:', assignment);
        alert('Assignment submitted successfully!');
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Failed to submit: ' + error.message);
    }
}
```

#### Update Assignment

```typescript
import { updateAssignment, getCurrentUser } from './api.js';

async function handleUpdateAssignment(assignmentId: number) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Please login first');
        return;
    }
    
    try {
        const updated = await updateAssignment(
            assignmentId,
            {
                title: 'Updated Title',
                content: 'Updated content...'
            },
            user.id
        );
        
        console.log('Assignment updated:', updated);
    } catch (error) {
        console.error('Update failed:', error);
        alert('Cannot update: ' + error.message);
    }
}
```

#### Get Assignment by ID

```typescript
import { getAssignmentById, getCurrentUser } from './api.js';

async function viewAssignment(assignmentId: number) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Please login first');
        return;
    }
    
    try {
        const assignment = await getAssignmentById(assignmentId, user.id);
        console.log('Assignment details:', assignment);
        return assignment;
    } catch (error) {
        console.error('Failed to load assignment:', error);
    }
}
```

---

## 🔄 Contoh Workflow Lengkap

### Workflow: Student Enroll dan Submit Assignment

```typescript
import {
    loginUser,
    saveCurrentUser,
    getAllCourses,
    enrollMeInCourse,
    getMyCourses,
    submitAssignment,
    getMyAssignments
} from './api.js';

async function studentWorkflow() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const user = await loginUser('student@example.com', 'password', 'student');
        saveCurrentUser(user);
        console.log('Logged in as:', user.name);
        
        // 2. Lihat semua courses
        console.log('2. Loading courses...');
        const courses = await getAllCourses();
        console.log('Available courses:', courses.length);
        
        // 3. Enroll ke course pertama
        console.log('3. Enrolling in course...');
        await enrollMeInCourse(courses[0].id);
        console.log('Enrolled in:', courses[0].title);
        
        // 4. Lihat enrolled courses
        console.log('4. My enrolled courses:');
        const myCourses = await getMyCourses();
        console.log('Total enrolled:', myCourses.length);
        
        // 5. Submit assignment
        console.log('5. Submitting assignment...');
        const assignment = await submitAssignment(
            {
                courseId: courses[0].id,
                title: 'My First Assignment',
                content: 'Assignment content here...'
            },
            user.id
        );
        console.log('Assignment submitted:', assignment.id);
        
        // 6. Lihat semua assignments
        console.log('6. My assignments:');
        const assignments = await getMyAssignments();
        assignments.forEach(a => {
            console.log(`- ${a.title} (${a.status})`);
        });
        
    } catch (error) {
        console.error('Error in workflow:', error);
    }
}
```

---

## 🛠️ Error Handling

Selalu gunakan try-catch untuk menangani error:

```typescript
async function safeApiCall() {
    try {
        const courses = await getAllCourses();
        // Success handling
        return courses;
    } catch (error) {
        // Error handling
        console.error('API Error:', error);
        
        // Tampilkan pesan ke user
        alert('Failed to load data. Please try again.');
        
        // Atau return fallback data
        return [];
    }
}
```

---

## 💡 Tips & Best Practices

1. **Selalu gunakan try-catch** untuk menangani error
2. **Check user login** sebelum memanggil fungsi yang memerlukan authentication
3. **Check user role** untuk fungsi admin-only atau student-only
4. **Gunakan convenience functions** (`getMyCourses()`, `enrollMeInCourse()`) untuk lebih mudah
5. **Simpan user ke localStorage** setelah login menggunakan `saveCurrentUser()`
6. **Clear localStorage** saat logout menggunakan `clearCurrentUser()`

---

## 📋 Daftar Semua Fungsi API

### Authentication
- `registerUser(name, email, password, role)` - Register user baru
- `loginUser(email, password, role)` - Login user
- `getCurrentUser()` - Get current user dari localStorage
- `saveCurrentUser(user)` - Simpan user ke localStorage
- `clearCurrentUser()` - Hapus user dari localStorage (logout)

### Courses
- `getAllCourses()` - Get semua courses
- `getCourseById(courseId)` - Get course by ID
- `createCourse(courseData, userId)` - Create course (Admin)
- `updateCourse(courseId, courseData, userId)` - Update course (Admin)
- `deleteCourse(courseId, userId)` - Delete course (Admin)

### Enrollment
- `enrollInCourse(courseId, userId)` - Enroll student ke course
- `enrollMeInCourse(courseId)` - Enroll current user (convenience)

### Student
- `getStudentCourses(studentId)` - Get enrolled courses
- `getStudentAssignments(studentId)` - Get student assignments
- `getMyCourses()` - Get enrolled courses untuk current user (convenience)
- `getMyAssignments()` - Get assignments untuk current user (convenience)

### Assignments
- `submitAssignment(assignmentData, userId)` - Submit assignment baru
- `updateAssignment(assignmentId, assignmentData, userId)` - Update assignment
- `getAssignmentById(assignmentId, userId)` - Get assignment by ID

---

## 🔗 File Terkait

- **`src/frontend/api.ts`** - File utama berisi semua fungsi API
- **`src/frontend/app.ts`** - Aplikasi utama yang menggunakan api.ts
- **`API_DOCUMENTATION.md`** - Dokumentasi lengkap semua endpoint
- **`CARA_GET_API.md`** - Panduan umum penggunaan Fetch API

---

## ❓ Pertanyaan?

Jika ada pertanyaan atau butuh bantuan, lihat:
1. Komentar di file `src/frontend/api.ts`
2. Dokumentasi di `API_DOCUMENTATION.md`
3. Contoh penggunaan di file ini

