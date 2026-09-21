# ✅ API Sudah Ada di Kodingan - Cara Menggunakan

## 📍 Status API

**✅ YA, API sudah ada di kodingan!**

File API sudah dibuat di: **`src/frontend/api.ts`**

File ini berisi **semua fungsi untuk berkomunikasi dengan API backend**.

---

## 🔍 Di Mana API-nya?

### File API: `src/frontend/api.ts`

File ini sudah berisi:
- ✅ Semua fungsi authentication (login, register)
- ✅ Semua fungsi courses (get, create, update, delete)
- ✅ Semua fungsi enrollment
- ✅ Semua fungsi assignments
- ✅ Helper functions untuk localStorage
- ✅ Dokumentasi lengkap di setiap fungsi

### File Aplikasi: `src/frontend/app.ts`

**Status saat ini:**
- ❌ Masih menggunakan `fetch` manual
- ❌ Belum menggunakan fungsi dari `api.ts`
- ✅ **Tapi bisa diubah untuk menggunakan `api.ts`**

---

## 🚀 Cara Menggunakan API yang Sudah Ada

### **Langkah 1: Import Fungsi API**

Di bagian atas file `src/frontend/app.ts`, tambahkan import:

```typescript
// Import fungsi API yang sudah ada
import {
    loginUser,
    registerUser,
    saveCurrentUser,
    clearCurrentUser,
    getAllCourses,
    enrollMeInCourse,
    getMyCourses,
    getMyAssignments,
    submitAssignment,
    updateAssignment,
    createCourse,
    updateCourse,
    deleteCourse
} from './api.js';
```

### **Langkah 2: Ganti Kode yang Menggunakan Fetch Manual**

#### **Contoh 1: Login (SEBELUM vs SESUDAH)**

**SEBELUM (menggunakan fetch manual):**
```typescript
async function handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const role = (document.getElementById('loginRole') as HTMLSelectElement).value as UserRole;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            // ... rest of code
        } else {
            showErrorMessage(data.message || 'Login failed');
        }
    } catch (error) {
        showErrorMessage('Network error...');
    }
}
```

**SESUDAH (menggunakan api.ts):**
```typescript
async function handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const role = (document.getElementById('loginRole') as HTMLSelectElement).value as UserRole;

    try {
        // Gunakan fungsi dari api.ts - lebih sederhana!
        const user = await loginUser(email, password, role);
        
        // Simpan user menggunakan helper function
        saveCurrentUser(user);
        currentUser = user;
        
        updateUIForUser();
        closeModal('authModal');
        showSuccessMessage('Login successful!');
        
        if (currentUser.role === 'student') {
            showPage('studentDashboard');
            loadStudentData();
        } else if (currentUser.role === 'admin') {
            showPage('adminDashboard');
            loadAdminData();
        }
    } catch (error: any) {
        showErrorMessage(error.message || 'Login failed');
        console.error('Login error:', error);
    }
}
```

#### **Contoh 2: Load Courses**

**SEBELUM:**
```typescript
async function loadCourses(): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        const data = await response.json();
        courses = data.courses || [];
        displayCourses(courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        courses = getLocalCourses();
        displayCourses(courses);
    }
}
```

**SESUDAH:**
```typescript
async function loadCourses(): Promise<void> {
    try {
        // Gunakan fungsi dari api.ts
        courses = await getAllCourses();
        displayCourses(courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        // Fallback to local data if API fails
        courses = getLocalCourses();
        displayCourses(courses);
    }
}
```

#### **Contoh 3: Enroll in Course**

**SEBELUM:**
```typescript
async function enrollInCourse(courseId: number): Promise<void> {
    if (!currentUser || currentUser.role !== 'student') {
        showErrorMessage('Please login as a student to enroll');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            showSuccessMessage('Successfully enrolled!');
            loadStudentData();
        } else {
            showErrorMessage(data.message || 'Enrollment failed');
        }
    } catch (error) {
        console.error('Enrollment error:', error);
    }
}
```

**SESUDAH:**
```typescript
async function enrollInCourse(courseId: number): Promise<void> {
    if (!currentUser || currentUser.role !== 'student') {
        showErrorMessage('Please login as a student to enroll');
        return;
    }

    try {
        // Gunakan convenience function - lebih mudah!
        await enrollMeInCourse(courseId);
        
        showSuccessMessage('Successfully enrolled in course!');
        loadStudentData();
    } catch (error: any) {
        showErrorMessage(error.message || 'Enrollment failed');
        console.error('Enrollment error:', error);
    }
}
```

---

## 📋 Daftar Semua Fungsi API yang Tersedia

### **Authentication**
```typescript
loginUser(email, password, role)           // Login user
registerUser(name, email, password, role)  // Register user baru
saveCurrentUser(user)                      // Simpan user ke localStorage
clearCurrentUser()                         // Hapus user (logout)
getCurrentUser()                           // Get user dari localStorage
```

### **Courses**
```typescript
getAllCourses()                            // Get semua courses
getCourseById(courseId)                    // Get course by ID
createCourse(courseData, userId)           // Create course (Admin)
updateCourse(courseId, courseData, userId) // Update course (Admin)
deleteCourse(courseId, userId)             // Delete course (Admin)
```

### **Enrollment**
```typescript
enrollInCourse(courseId, userId)          // Enroll student
enrollMeInCourse(courseId)                 // Enroll current user (convenience)
```

### **Student Data**
```typescript
getStudentCourses(studentId)               // Get enrolled courses
getStudentAssignments(studentId)           // Get assignments
getMyCourses()                             // Get enrolled courses untuk current user
getMyAssignments()                         // Get assignments untuk current user
```

### **Assignments**
```typescript
submitAssignment(assignmentData, userId)    // Submit assignment
updateAssignment(assignmentId, data, userId) // Update assignment
getAssignmentById(assignmentId, userId)    // Get assignment by ID
```

---

## 💡 Keuntungan Menggunakan api.ts

### **Sebelum (fetch manual):**
- ❌ 15+ baris kode per API call
- ❌ Error handling manual
- ❌ Harus set headers manual
- ❌ Harus parse response manual
- ❌ Kode berulang-ulang

### **Sesudah (menggunakan api.ts):**
- ✅ 1-3 baris kode per API call
- ✅ Error handling otomatis
- ✅ Headers sudah di-handle
- ✅ Response sudah di-parse
- ✅ Kode lebih bersih dan mudah di-maintain

---

## 🎯 Quick Start: Cara Menggunakan Sekarang

### **Opsi 1: Gunakan Langsung di Browser Console**

1. Buka aplikasi di browser
2. Tekan **F12** untuk buka Developer Tools
3. Buka tab **Console**
4. Import dan gunakan:

```javascript
// Import fungsi (jika menggunakan ES modules)
import { getAllCourses } from './dist/frontend/api.js';

// Atau gunakan fetch langsung
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => console.log(data));
```

### **Opsi 2: Update app.ts untuk Menggunakan api.ts**

1. Buka file `src/frontend/app.ts`
2. Tambahkan import di bagian atas:
```typescript
import { getAllCourses, loginUser, saveCurrentUser } from './api.js';
```
3. Ganti fungsi yang menggunakan fetch manual dengan fungsi dari api.ts
4. Rebuild: `npm run build`

### **Opsi 3: Lihat Contoh Implementasi**

Baca file: **`src/frontend/app-contoh-penggunaan-api.ts`**

File ini berisi contoh lengkap cara menggunakan api.ts di app.ts.

---

## 📖 Dokumentasi Lengkap

Untuk dokumentasi lengkap, lihat:

1. **`CARA_MENGGUNAKAN_API.md`** - Panduan lengkap dengan contoh
2. **`src/frontend/api.ts`** - File API dengan komentar lengkap
3. **`src/frontend/app-contoh-penggunaan-api.ts`** - Contoh implementasi
4. **`PANDUAN_API_DI_KODINGAN.md`** - Ringkasan semua file

---

## ✅ Kesimpulan

**API sudah ada di kodingan!** 

- 📁 File: `src/frontend/api.ts`
- ✅ Semua fungsi sudah tersedia
- ✅ Dokumentasi lengkap
- ✅ Siap digunakan

**Cara menggunakan:**
1. Import fungsi dari `api.ts`
2. Ganti fetch manual dengan fungsi dari `api.ts`
3. Kode menjadi lebih bersih dan mudah di-maintain

---

**Selamat coding! 🚀**

