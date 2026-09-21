# 📝 Cara Menambahkan Data Tanpa Hardcode & Setup Database

## 🎯 Situasi Saat Ini

**Data saat ini di-hardcode di `src/backend/server.ts`:**
```typescript
let courses: Course[] = [
    {
        id: 1,
        title: 'Introduction to Web Development',
        // ... hardcoded
    },
    // ... lebih banyak hardcoded courses
];
```

**Masalah:**
- ❌ Data hilang saat server restart
- ❌ Harus edit kode untuk menambah data
- ❌ Tidak persisten

---

## ✅ Solusi: 2 Opsi

### **Opsi 1: Tetap In-Memory (Tidak Hardcode)**
- ✅ Data bisa ditambah via API (tidak perlu hardcode)
- ✅ Mudah untuk development
- ❌ Data hilang saat server restart
- ✅ **Cocok untuk: Development & Testing**

### **Opsi 2: Setup Database**
- ✅ Data persisten (tidak hilang)
- ✅ Bisa handle banyak data
- ✅ Lebih aman dan scalable
- ✅ **Cocok untuk: Production**

---

## 🚀 OPSI 1: Menambahkan Data via API (Tanpa Hardcode)

### **Cara Menambahkan Data:**

#### **1. Menambahkan Course (Admin)**

**Via Aplikasi:**
1. Login sebagai Admin
2. Buka Admin Dashboard
3. Klik "Add Course"
4. Isi form:
   - Title: "New Course"
   - Description: "Course description"
   - Category: "programming"
   - Duration: 40
5. Klik "Create"
6. ✅ Course sudah ditambahkan!

**Via API langsung:**
```javascript
// Di browser console atau Postman
fetch('http://localhost:3000/api/courses', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1' // User ID admin
    },
    body: JSON.stringify({
        title: 'New Course Title',
        description: 'Course description here',
        category: 'programming',
        duration: 40
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### **2. Menambahkan User (Register)**

**Via Aplikasi:**
1. Klik "Login/Register"
2. Pilih tab "Register"
3. Isi form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Role: "student" atau "admin"
4. Klik "Register"
5. ✅ User sudah ditambahkan!

**Via API langsung:**
```javascript
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### **3. Menambahkan Enrollment (Student Enroll)**

**Via Aplikasi:**
1. Login sebagai Student
2. Buka halaman "Courses"
3. Klik "Enroll" pada course yang diinginkan
4. ✅ Enrollment sudah ditambahkan!

#### **4. Menambahkan Assignment (Student Submit)**

**Via Aplikasi:**
1. Login sebagai Student
2. Buka Dashboard
3. Klik "Submit Assignment"
4. Isi form dan submit
5. ✅ Assignment sudah ditambahkan!

---

### **Menghapus Hardcode dari server.ts**

**SEBELUM (Hardcode):**
```typescript
let courses: Course[] = [
    {
        id: 1,
        title: 'Introduction to Web Development',
        // ... hardcoded
    },
    // ... lebih banyak
];
```

**SESUDAH (Tidak Hardcode):**
```typescript
let courses: Course[] = []; // Kosong, data ditambah via API
```

**Atau dengan data seed awal (opsional):**
```typescript
let courses: Course[] = []; // Kosong

// Fungsi untuk seed data awal (opsional)
function seedInitialData() {
    if (courses.length === 0) {
        courses.push(
            {
                id: 1,
                title: 'Introduction to Web Development',
                description: 'Learn the fundamentals...',
                category: 'programming',
                duration: 40,
                createdAt: new Date().toISOString()
            }
            // ... lebih banyak jika perlu
        );
    }
}

// Panggil saat server start (opsional)
// seedInitialData();
```

---

## 🗄️ OPSI 2: Setup Database

### **Pilihan Database:**

1. **MongoDB** (NoSQL) - Recommended untuk mudah
2. **PostgreSQL** (SQL) - Recommended untuk production
3. **SQLite** (SQL) - Paling mudah, file-based

Saya akan memberikan contoh dengan **MongoDB** (paling mudah) dan **SQLite** (paling sederhana).

---

## 📦 Setup MongoDB

### **Langkah 1: Install MongoDB**

**Windows:**
1. Download MongoDB: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. MongoDB akan berjalan di `mongodb://localhost:27017`

**Atau gunakan MongoDB Atlas (Cloud - Gratis):**
1. Daftar di https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis
3. Dapatkan connection string

### **Langkah 2: Install Dependencies**

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

### **Langkah 3: Buat File Database Connection**

Buat file: `src/backend/database.ts`

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}
```

### **Langkah 4: Buat Models**

Buat file: `src/backend/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
```

Buat file: `src/backend/models/Course.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    category: 'programming' | 'design' | 'business' | 'language';
    duration: number;
    createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['programming', 'design', 'business', 'language'], required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
```

Buat file: `src/backend/models/Enrollment.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
    studentId: number;
    courseId: number;
    enrolledAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
    studentId: { type: Number, required: true },
    courseId: { type: Number, required: true },
    enrolledAt: { type: Date, default: Date.now }
});

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
```

Buat file: `src/backend/models/Assignment.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
    studentId: number;
    courseId: number;
    title: string;
    content: string;
    status: 'submitted' | 'pending' | 'graded';
    submittedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
    studentId: { type: Number, required: true },
    courseId: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['submitted', 'pending', 'graded'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
```

### **Langkah 5: Update server.ts untuk Menggunakan Database**

Ganti bagian in-memory dengan database calls:

```typescript
import { connectDatabase } from './database.js';
import { User as UserModel } from './models/User.js';
import { Course as CourseModel } from './models/Course.js';
import { Enrollment as EnrollmentModel } from './models/Enrollment.js';
import { Assignment as AssignmentModel } from './models/Assignment.js';

// Connect to database saat server start
connectDatabase();

// Ganti endpoint untuk menggunakan database
app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    
    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        
        // Buat user baru
        const newUser = new UserModel({
            name,
            email,
            password,
            role
        });
        
        await newUser.save();
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/courses', async (_req: Request, res: Response) => {
    try {
        const courses = await CourseModel.find();
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/courses', authenticateUser, requireAdmin, async (req: AuthRequest, res: Response) => {
    const { title, description, category, duration } = req.body;
    
    try {
        const newCourse = new CourseModel({
            title,
            description,
            category,
            duration
        });
        
        await newCourse.save();
        
        res.status(201).json({
            message: 'Course created successfully',
            course: newCourse
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ... dan seterusnya untuk endpoint lainnya
```

---

## 📦 Setup SQLite (Alternatif - Lebih Mudah)

### **Langkah 1: Install Dependencies**

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

### **Langkah 2: Buat File Database**

Buat file: `src/backend/database.ts`

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/lms.db');
const db = new Database(dbPath);

// Buat tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('programming', 'design', 'business', 'language')),
        duration INTEGER NOT NULL,
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        enrolledAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (courseId) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'pending', 'graded')),
        submittedAt TEXT NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (courseId) REFERENCES courses(id)
    );
`);

export default db;
```

### **Langkah 3: Update server.ts**

```typescript
import db from './database.js';

// Get all courses
app.get('/api/courses', (_req: Request, res: Response) => {
    try {
        const courses = db.prepare('SELECT * FROM courses').all();
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create course
app.post('/api/courses', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, description, category, duration } = req.body;
    
    try {
        const stmt = db.prepare(`
            INSERT INTO courses (title, description, category, duration, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(title, description, category, duration, new Date().toISOString());
        
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
        
        res.status(201).json({
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
```

---

## 🎯 Rekomendasi

### **Untuk Development:**
- ✅ Gunakan **Opsi 1** (In-Memory via API)
- ✅ Data bisa ditambah via aplikasi/API
- ✅ Tidak perlu setup database
- ✅ Cepat untuk development

### **Untuk Production:**
- ✅ Gunakan **Opsi 2** dengan **MongoDB** atau **PostgreSQL**
- ✅ Data persisten
- ✅ Lebih aman dan scalable

---

## 📝 Ringkasan

### **Cara Menambahkan Data (Tanpa Hardcode):**

1. **Via Aplikasi:**
   - Login → Admin Dashboard → Add Course
   - Register → User baru
   - Student → Enroll → Submit Assignment

2. **Via API:**
   - POST `/api/courses` - Tambah course
   - POST `/api/auth/register` - Tambah user
   - POST `/api/courses/:id/enroll` - Enroll
   - POST `/api/assignments` - Submit assignment

3. **Database:**
   - Setup MongoDB atau SQLite
   - Data akan tersimpan permanen
   - Tidak hilang saat server restart

---

**Pilih opsi yang sesuai dengan kebutuhan Anda!** 🚀

