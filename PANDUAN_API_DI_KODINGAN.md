# 📘 Panduan Lengkap: Menggunakan API di Kodingan

File ini menjelaskan semua file yang sudah dibuat dan cara menggunakannya.

---

## 📁 File-file yang Sudah Dibuat

### 1. **`src/frontend/api.ts`** ⭐ FILE UTAMA
File ini berisi **semua fungsi untuk berkomunikasi dengan API**.

**Isi:**
- ✅ Semua fungsi API (authentication, courses, enrollment, assignments)
- ✅ Dokumentasi lengkap di setiap fungsi
- ✅ Type safety dengan TypeScript
- ✅ Error handling yang konsisten
- ✅ Helper functions untuk localStorage

**Cara Menggunakan:**
```typescript
import { getAllCourses, loginUser } from './api.js';

// Gunakan fungsi
const courses = await getAllCourses();
const user = await loginUser('email@example.com', 'password', 'student');
```

---

### 2. **`CARA_MENGGUNAKAN_API.md`** 📚
Panduan lengkap dengan contoh-contoh penggunaan setiap fungsi API.

**Isi:**
- ✅ Penjelasan setiap fungsi
- ✅ Contoh kode untuk setiap use case
- ✅ Workflow lengkap
- ✅ Tips & best practices

**Cara Menggunakan:**
Baca file ini untuk memahami cara menggunakan setiap fungsi API.

---

### 3. **`src/frontend/app-contoh-penggunaan-api.ts`** 💡
File contoh yang menunjukkan cara menggunakan `api.ts` di aplikasi.

**Isi:**
- ✅ Perbandingan kode SEBELUM dan SESUDAH
- ✅ Contoh implementasi di app.ts
- ✅ Penjelasan keuntungan menggunakan api.ts

**Cara Menggunakan:**
Lihat file ini untuk melihat contoh implementasi yang benar.

---

### 4. **`CARA_GET_API.md`** 📖
Panduan umum tentang Fetch API dan cara mengambil data.

**Isi:**
- ✅ Penjelasan Fetch API
- ✅ Contoh-contoh dasar
- ✅ Template umum

---

### 5. **`contoh-api-usage.js`** 🧪
File JavaScript dengan fungsi-fungsi siap pakai untuk testing di browser console.

**Cara Menggunakan:**
1. Buka browser console (F12)
2. Copy fungsi dari file ini
3. Jalankan fungsi tersebut

---

### 6. **`test-api.html`** 🖥️
Halaman web untuk testing API dengan UI yang mudah digunakan.

**Cara Menggunakan:**
1. Pastikan server berjalan: `npm start`
2. Buka file `test-api.html` di browser
3. Klik tombol-tombol untuk test API

---

## 🚀 Quick Start

### Langkah 1: Import Fungsi API

Di file TypeScript/JavaScript Anda:

```typescript
// Import fungsi yang diperlukan
import {
    getAllCourses,
    loginUser,
    saveCurrentUser,
    enrollMeInCourse,
    getMyCourses
} from './api.js';
```

### Langkah 2: Gunakan Fungsi

```typescript
// Contoh: Load courses
async function loadCourses() {
    try {
        const courses = await getAllCourses();
        console.log('Courses:', courses);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Contoh: Login
async function login() {
    try {
        const user = await loginUser('email@example.com', 'password', 'student');
        saveCurrentUser(user); // Simpan ke localStorage
        console.log('Logged in:', user.name);
    } catch (error) {
        console.error('Login failed:', error);
    }
}
```

---

## 📋 Daftar Semua Fungsi API

### Authentication
```typescript
registerUser(name, email, password, role)
loginUser(email, password, role)
getCurrentUser()
saveCurrentUser(user)
clearCurrentUser()
```

### Courses
```typescript
getAllCourses()
getCourseById(courseId)
createCourse(courseData, userId)      // Admin only
updateCourse(courseId, courseData, userId)  // Admin only
deleteCourse(courseId, userId)        // Admin only
```

### Enrollment
```typescript
enrollInCourse(courseId, userId)
enrollMeInCourse(courseId)            // Convenience (auto use currentUser)
```

### Student
```typescript
getStudentCourses(studentId)
getStudentAssignments(studentId)
getMyCourses()                        // Convenience (auto use currentUser)
getMyAssignments()                    // Convenience (auto use currentUser)
```

### Assignments
```typescript
submitAssignment(assignmentData, userId)
updateAssignment(assignmentId, assignmentData, userId)
getAssignmentById(assignmentId, userId)
```

---

## 💡 Contoh Workflow Lengkap

### Workflow: Student Login → Enroll → Submit Assignment

```typescript
import {
    loginUser,
    saveCurrentUser,
    getAllCourses,
    enrollMeInCourse,
    getMyCourses,
    submitAssignment
} from './api.js';

async function studentWorkflow() {
    try {
        // 1. Login
        const user = await loginUser('student@example.com', 'password', 'student');
        saveCurrentUser(user);
        
        // 2. Lihat courses
        const courses = await getAllCourses();
        
        // 3. Enroll
        await enrollMeInCourse(courses[0].id);
        
        // 4. Lihat enrolled courses
        const myCourses = await getMyCourses();
        
        // 5. Submit assignment
        await submitAssignment({
            courseId: courses[0].id,
            title: 'Assignment 1',
            content: 'Content here...'
        }, user.id);
        
        console.log('Workflow completed!');
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

## 🔄 Cara Mengintegrasikan ke app.ts

### Opsi 1: Mengganti Kode Secara Bertahap

1. Import fungsi dari `api.ts`:
```typescript
import { loginUser, saveCurrentUser } from './api.js';
```

2. Ganti fungsi `handleLogin`:
```typescript
// SEBELUM
async function handleLogin(e: Event): Promise<void> {
    // ... fetch manual ...
}

// SESUDAH
async function handleLogin(e: Event): Promise<void> {
    try {
        const user = await loginUser(email, password, role);
        saveCurrentUser(user);
        // ... rest of code ...
    } catch (error) {
        // ... error handling ...
    }
}
```

### Opsi 2: Lihat Contoh di `app-contoh-penggunaan-api.ts`

File ini berisi contoh lengkap cara mengganti kode di `app.ts`.

---

## 📖 Dokumentasi Lengkap

Untuk dokumentasi lengkap, lihat:
1. **`CARA_MENGGUNAKAN_API.md`** - Panduan lengkap dengan contoh
2. **`src/frontend/api.ts`** - Komentar di setiap fungsi
3. **`API_DOCUMENTATION.md`** - Dokumentasi semua endpoint

---

## 🧪 Testing

### Cara 1: Menggunakan test-api.html
1. Buka `test-api.html` di browser
2. Klik tombol-tombol untuk test API

### Cara 2: Menggunakan Browser Console
1. Buka browser console (F12)
2. Copy fungsi dari `contoh-api-usage.js`
3. Jalankan fungsi

### Cara 3: Menggunakan Kode di Aplikasi
Import dan gunakan fungsi langsung di aplikasi Anda.

---

## ❓ FAQ

### Q: Apakah saya harus menggunakan api.ts?
**A:** Tidak wajib, tapi sangat direkomendasikan karena:
- Kode lebih bersih
- Lebih mudah di-maintain
- Error handling konsisten
- Type safety lebih baik

### Q: Bagaimana cara mengganti kode yang sudah ada?
**A:** Lihat file `app-contoh-penggunaan-api.ts` untuk contoh perbandingan.

### Q: Apakah semua fungsi sudah tersedia?
**A:** Ya, semua endpoint API sudah ada di `api.ts`.

### Q: Bagaimana cara menambahkan fungsi baru?
**A:** Tambahkan fungsi baru di `api.ts` dengan format yang sama.

---

## 🎯 Kesimpulan

1. **File utama:** `src/frontend/api.ts` - Import dan gunakan fungsi di sini
2. **Panduan:** `CARA_MENGGUNAKAN_API.md` - Baca untuk contoh lengkap
3. **Contoh:** `app-contoh-penggunaan-api.ts` - Lihat untuk implementasi
4. **Testing:** `test-api.html` atau `contoh-api-usage.js`

---

## 📞 Butuh Bantuan?

1. Baca dokumentasi di `CARA_MENGGUNAKAN_API.md`
2. Lihat contoh di `app-contoh-penggunaan-api.ts`
3. Baca komentar di `src/frontend/api.ts`
4. Test menggunakan `test-api.html`

---

**Selamat coding! 🚀**

