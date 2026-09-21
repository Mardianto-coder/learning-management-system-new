# 🚀 Quick Start: Menambahkan Data Tanpa Hardcode

## ✅ Cara Cepat: Menghapus Hardcode

### **Langkah 1: Update server.ts**

Ganti baris ini di `src/backend/server.ts`:

**SEBELUM:**
```typescript
let courses: Course[] = [
    {
        id: 1,
        title: 'Introduction to Web Development',
        // ... hardcoded data
    },
    // ... lebih banyak
];
let nextCourseId = 5;
```

**SESUDAH:**
```typescript
let courses: Course[] = []; // KOSONG - tidak hardcode!
let nextCourseId = 1; // Mulai dari 1
```

### **Langkah 2: Rebuild**

```bash
npm run build
npm start
```

### **Langkah 3: Tambah Data via Aplikasi**

1. **Register Admin:**
   - Buka aplikasi
   - Klik "Login/Register"
   - Tab "Register"
   - Isi form dengan role "admin"
   - Klik "Register"

2. **Login sebagai Admin:**
   - Login dengan akun admin yang baru dibuat
   - Buka Admin Dashboard

3. **Tambah Course:**
   - Klik "Add Course"
   - Isi form:
     - Title: "Introduction to Web Development"
     - Description: "Learn HTML, CSS, JavaScript"
     - Category: "programming"
     - Duration: 40
   - Klik "Create"
   - ✅ Course sudah ditambahkan!

4. **Tambah Course Lainnya:**
   - Ulangi langkah 3 untuk menambah course lainnya

---

## 🎯 Cara Menambahkan Data

### **Via Aplikasi (Paling Mudah):**

#### **1. Tambah User:**
- Register via aplikasi
- Atau Admin bisa register user baru

#### **2. Tambah Course (Admin):**
- Login sebagai Admin
- Admin Dashboard → Add Course
- Isi form dan Create

#### **3. Enroll (Student):**
- Login sebagai Student
- Courses → Klik "Enroll"

#### **4. Submit Assignment (Student):**
- Login sebagai Student
- Dashboard → Submit Assignment
- Isi form dan Submit

---

### **Via API (Advanced):**

#### **Tambah Course via API:**

```javascript
// Di browser console (F12)
fetch('http://localhost:3000/api/courses', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1' // User ID admin
    },
    body: JSON.stringify({
        title: 'New Course',
        description: 'Course description',
        category: 'programming',
        duration: 40
    })
})
.then(res => res.json())
.then(data => console.log('Course created:', data));
```

#### **Register User via API:**

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
.then(data => console.log('User registered:', data));
```

---

## 📝 Catatan Penting

### **Data In-Memory:**
- ✅ Data bisa ditambah via API (tidak hardcode)
- ❌ Data hilang saat server restart
- ✅ Cocok untuk development

### **Untuk Data Permanen:**
- Gunakan Database (MongoDB, PostgreSQL, SQLite)
- Lihat file: `CARA_MENAMBAHKAN_DATA_DAN_DATABASE.md`

---

## ✅ Checklist

- [ ] Update `server.ts` - hapus hardcode courses
- [ ] Rebuild aplikasi: `npm run build`
- [ ] Start server: `npm start`
- [ ] Register admin pertama
- [ ] Login sebagai admin
- [ ] Tambah courses via Admin Dashboard
- [ ] Test aplikasi

---

**Selesai! Data sekarang bisa ditambah via aplikasi tanpa hardcode! 🎉**

