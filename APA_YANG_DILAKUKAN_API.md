# 📘 Apa yang Dilakukan API di LMS Platform?

API di aplikasi LMS ini berfungsi sebagai **jembatan komunikasi** antara **Frontend (Browser)** dan **Backend (Server)**. API memungkinkan aplikasi web untuk mengambil, menyimpan, mengupdate, dan menghapus data.

---

## 🎯 Fungsi Utama API

API ini melakukan **4 hal utama**:

1. **🔐 Authentication** - Mengelola login, register, dan session user
2. **📚 Course Management** - Mengelola data courses (mata kuliah)
3. **🎓 Enrollment** - Mengelola pendaftaran student ke courses
4. **📝 Assignment Management** - Mengelola tugas/assignment student

---

## 📋 Detail Fungsi API

### 1. 🔐 **AUTHENTICATION API**

#### **a. Register User** (`POST /api/auth/register`)
**Apa yang dilakukan:**
- Menerima data user baru (nama, email, password, role)
- Memvalidasi data (cek email sudah terdaftar atau belum)
- Menyimpan user baru ke database (saat ini: memory)
- Mengembalikan data user yang sudah terdaftar

**Kapan digunakan:**
- Saat user baru mendaftar
- Saat admin membuat akun baru

**Contoh:**
```typescript
// User mendaftar dengan data:
{
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "student"
}

// API menyimpan data dan mengembalikan:
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "student"
}
```

#### **b. Login User** (`POST /api/auth/login`)
**Apa yang dilakukan:**
- Menerima email, password, dan role
- Mencari user di database berdasarkan email
- Memverifikasi password dan role
- Mengembalikan data user jika valid

**Kapan digunakan:**
- Saat user login ke aplikasi
- Untuk autentikasi setiap request

**Contoh:**
```typescript
// User login dengan:
{
  email: "john@example.com",
  password: "password123",
  role: "student"
}

// API memverifikasi dan mengembalikan:
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "student"
}
```

---

### 2. 📚 **COURSE MANAGEMENT API**

#### **a. Get All Courses** (`GET /api/courses`)
**Apa yang dilakukan:**
- Mengambil semua courses yang tersedia
- Mengembalikan list courses dengan detail lengkap

**Kapan digunakan:**
- Saat membuka halaman "Courses"
- Saat menampilkan daftar courses di dashboard

**Contoh Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "Learn HTML, CSS, JavaScript",
      "category": "programming",
      "duration": 40
    },
    {
      "id": 2,
      "title": "UI/UX Design",
      "description": "Master design principles",
      "category": "design",
      "duration": 30
    }
  ]
}
```

#### **b. Get Course by ID** (`GET /api/courses/:id`)
**Apa yang dilakukan:**
- Mencari course berdasarkan ID
- Mengembalikan detail lengkap course

**Kapan digunakan:**
- Saat user klik course untuk lihat detail
- Saat menampilkan detail course di modal

#### **c. Create Course** (`POST /api/courses`) - **Admin Only**
**Apa yang dilakukan:**
- Menerima data course baru (title, description, category, duration)
- Memvalidasi user adalah admin
- Menyimpan course baru ke database
- Mengembalikan course yang baru dibuat

**Kapan digunakan:**
- Saat admin membuat course baru
- Saat admin menambah mata kuliah

**Contoh:**
```typescript
// Admin membuat course:
{
  title: "Advanced JavaScript",
  description: "Learn advanced JS concepts",
  category: "programming",
  duration: 50
}

// API menyimpan dan mengembalikan course dengan ID baru
```

#### **d. Update Course** (`PUT /api/courses/:id`) - **Admin Only**
**Apa yang dilakukan:**
- Menerima data course yang akan diupdate
- Memvalidasi user adalah admin
- Mencari course berdasarkan ID
- Mengupdate data course
- Mengembalikan course yang sudah diupdate

**Kapan digunakan:**
- Saat admin mengedit course yang sudah ada
- Saat admin memperbaiki informasi course

#### **e. Delete Course** (`DELETE /api/courses/:id`) - **Admin Only**
**Apa yang dilakukan:**
- Mencari course berdasarkan ID
- Memvalidasi user adalah admin
- Menghapus course dari database
- Menghapus semua enrollment dan assignment terkait

**Kapan digunakan:**
- Saat admin menghapus course
- Saat course tidak lagi tersedia

---

### 3. 🎓 **ENROLLMENT API**

#### **Enroll in Course** (`POST /api/courses/:id/enroll`) - **Student Only**
**Apa yang dilakukan:**
- Menerima ID course yang akan di-enroll
- Memvalidasi user adalah student
- Mencari course berdasarkan ID
- Mengecek apakah student sudah enroll
- Menyimpan enrollment ke database
- Mengembalikan konfirmasi enrollment

**Kapan digunakan:**
- Saat student klik tombol "Enroll" di course
- Saat student mendaftar ke mata kuliah

**Contoh Flow:**
```
1. Student melihat course "Web Development"
2. Student klik "Enroll"
3. API mengecek: Apakah sudah enroll? (Tidak)
4. API menyimpan enrollment
5. Student sekarang terdaftar di course tersebut
```

---

### 4. 👨‍🎓 **STUDENT DATA API**

#### **a. Get Student's Enrolled Courses** (`GET /api/students/:id/courses`)
**Apa yang dilakukan:**
- Mencari semua enrollment milik student
- Mengambil detail course untuk setiap enrollment
- Mengembalikan list courses yang di-enroll student

**Kapan digunakan:**
- Saat membuka Student Dashboard
- Saat menampilkan "My Courses"

**Contoh Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Web Development",
      "description": "...",
      "category": "programming"
    }
  ]
}
```

#### **b. Get Student's Assignments** (`GET /api/students/:id/assignments`)
**Apa yang dilakukan:**
- Mencari semua assignment milik student
- Mengambil detail course untuk setiap assignment
- Mengembalikan list assignments dengan status

**Kapan digunakan:**
- Saat membuka Student Dashboard
- Saat menampilkan "My Assignments"

**Contoh Response:**
```json
{
  "assignments": [
    {
      "id": 1,
      "courseId": 1,
      "title": "Assignment 1",
      "content": "My assignment content...",
      "status": "submitted",
      "submittedAt": "2025-01-15T10:30:00Z",
      "courseTitle": "Web Development"
    }
  ]
}
```

---

### 5. 📝 **ASSIGNMENT API**

#### **a. Submit Assignment** (`POST /api/assignments`) - **Student Only**
**Apa yang dilakukan:**
- Menerima data assignment (courseId, title, content)
- Memvalidasi user adalah student
- Mengecek apakah student sudah enroll di course
- Menyimpan assignment ke database
- Mengembalikan assignment yang baru dibuat

**Kapan digunakan:**
- Saat student submit tugas
- Saat student mengumpulkan assignment

**Contoh:**
```typescript
// Student submit assignment:
{
  courseId: 1,
  title: "Assignment 1: HTML Basics",
  content: "Here is my assignment..."
}

// API menyimpan dan mengembalikan:
{
  id: 1,
  courseId: 1,
  title: "Assignment 1: HTML Basics",
  content: "...",
  status: "submitted",
  submittedAt: "2025-01-15T10:30:00Z"
}
```

#### **b. Update Assignment** (`PUT /api/assignments/:id`) - **Student Only**
**Apa yang dilakukan:**
- Mencari assignment berdasarkan ID
- Memvalidasi assignment milik student yang login
- Mengecek apakah assignment sudah di-grade (tidak bisa diupdate)
- Mengupdate data assignment
- Mengembalikan assignment yang sudah diupdate

**Kapan digunakan:**
- Saat student ingin mengubah assignment yang sudah di-submit
- Saat assignment belum di-grade

**Catatan:** Assignment yang sudah di-grade tidak bisa diupdate.

#### **c. Get Assignment by ID** (`GET /api/assignments/:id`)
**Apa yang dilakukan:**
- Mencari assignment berdasarkan ID
- Memvalidasi user memiliki akses (student pemilik atau admin)
- Mengembalikan detail lengkap assignment

**Kapan digunakan:**
- Saat melihat detail assignment
- Saat admin review assignment

---

## 🔄 Alur Kerja API

### **Contoh: Student Enroll dan Submit Assignment**

```
1. Student Login
   └─> POST /api/auth/login
       └─> API memverifikasi credentials
           └─> Mengembalikan user data

2. Student Melihat Courses
   └─> GET /api/courses
       └─> API mengembalikan semua courses

3. Student Enroll ke Course
   └─> POST /api/courses/1/enroll
       └─> API mengecek: student belum enroll
           └─> API menyimpan enrollment
               └─> Mengembalikan konfirmasi

4. Student Lihat Enrolled Courses
   └─> GET /api/students/1/courses
       └─> API mencari semua enrollment student
           └─> Mengembalikan courses yang di-enroll

5. Student Submit Assignment
   └─> POST /api/assignments
       └─> API mengecek: student sudah enroll?
           └─> API menyimpan assignment
               └─> Mengembalikan assignment dengan status "submitted"

6. Student Lihat Assignments
   └─> GET /api/students/1/assignments
       └─> API mencari semua assignment student
           └─> Mengembalikan list assignments dengan status
```

---

## 🛡️ Keamanan API

### **1. Authentication**
- Semua endpoint (kecuali register, login, get courses) memerlukan authentication
- Menggunakan Bearer Token (User ID)
- Header: `Authorization: Bearer <user_id>`

### **2. Authorization**
- **Admin Only:** Create, Update, Delete Course
- **Student Only:** Enroll, Submit Assignment
- User hanya bisa akses data miliknya sendiri

### **3. Validation**
- Validasi input data (required fields)
- Validasi email sudah terdaftar atau belum
- Validasi role (student/admin)
- Validasi enrollment sebelum submit assignment

---

## 💾 Data Storage

**Saat ini:** In-memory (data hilang saat server restart)
- Users: Array di memory
- Courses: Array di memory
- Enrollments: Array di memory
- Assignments: Array di memory

**Untuk Production:** Perlu database (MongoDB, PostgreSQL, dll)

---

## 📊 Ringkasan Fungsi API

| Fungsi | Method | Endpoint | Auth | Role |
|--------|--------|----------|------|------|
| Register | POST | `/api/auth/register` | ❌ | - |
| Login | POST | `/api/auth/login` | ❌ | - |
| Get All Courses | GET | `/api/courses` | ❌ | - |
| Get Course | GET | `/api/courses/:id` | ❌ | - |
| Create Course | POST | `/api/courses` | ✅ | Admin |
| Update Course | PUT | `/api/courses/:id` | ✅ | Admin |
| Delete Course | DELETE | `/api/courses/:id` | ✅ | Admin |
| Enroll | POST | `/api/courses/:id/enroll` | ✅ | Student |
| Get My Courses | GET | `/api/students/:id/courses` | ✅ | Student |
| Get My Assignments | GET | `/api/students/:id/assignments` | ✅ | Student |
| Submit Assignment | POST | `/api/assignments` | ✅ | Student |
| Update Assignment | PUT | `/api/assignments/:id` | ✅ | Student |
| Get Assignment | GET | `/api/assignments/:id` | ✅ | Student/Admin |

---

## 🎯 Kesimpulan

**API ini melakukan:**

1. **Mengelola User** - Register, Login, Session
2. **Mengelola Courses** - CRUD operations untuk courses
3. **Mengelola Enrollment** - Student mendaftar ke courses
4. **Mengelola Assignments** - Student submit dan update tugas

**Tujuan utama:** Memungkinkan frontend (browser) berkomunikasi dengan backend (server) untuk mengelola data aplikasi LMS.

**Cara kerja:** Frontend mengirim request → Backend memproses → Backend mengembalikan response → Frontend menampilkan data

---

**API adalah "otak" aplikasi yang menghubungkan user interface dengan data! 🧠**

