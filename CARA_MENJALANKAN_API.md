# 🚀 Cara Menjalankan API Endpoints

## 📍 API Endpoints Tersedia di: `http://localhost:3000/api`

---

## 🎯 Langkah-langkah Menjalankan

### **Langkah 1: Pastikan Dependencies Terinstall**

```bash
npm install
```

### **Langkah 2: Build Aplikasi**

```bash
npm run build
```

Ini akan mengcompile TypeScript ke JavaScript.

### **Langkah 3: Jalankan Server**

Aplikasi utama (Next.js + React + Redux):

```bash
npm install --prefix web
npm run dev
```

**Output yang diharapkan:** halaman Home di `http://localhost:3000`. API ada di `/api/courses` (URL relatif, jadi juga jalan dari HP).

Versi Express lama:

```bash
npm run start:legacy
```

### **Langkah 4: Server Sudah Berjalan! ✅**

API endpoints sekarang bisa diakses di: **http://localhost:3000/api**

---

## 🛑 Cara Menonaktifkan Program (Stop Server)

Program berjalan selama terminal `npm start` / `npm run dev` masih terbuka. Menutup tab browser **tidak** mematikan server.

### **Cara 1: Dari terminal yang menjalankan server (disarankan)**

1. Klik jendela PowerShell / terminal tempat `npm start` berjalan.
2. Tekan **`Ctrl + C`**.
3. Jika diminta konfirmasi (`Terminate batch job (Y/N)?`), ketik **`Y`** lalu Enter.

Server berhenti. Halaman `http://localhost:3000` tidak akan bisa dibuka sampai dijalankan lagi.

### **Cara 2: Jika `Ctrl + C` tidak berhasil (PowerShell baru)**

```powershell
# Hentikan proses yang memakai port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Atau hentikan semua proses Node.js (akan mematikan semua aplikasi Node yang sedang jalan):

```powershell
taskkill /F /IM node.exe
```

### **Setelah dimatikan**

- Data **tidak hilang**. File di folder `data/` tetap tersimpan.
- Untuk menjalankan kembali: `npm start`, lalu buka `http://localhost:3000`.

---

## 🧪 Cara Test API Endpoints

### **Metode 1: Via Browser (Paling Mudah)**

#### **1. Test Get All Courses:**
Buka browser dan akses:
```
http://localhost:3000/api/courses
```

Anda akan melihat JSON response dengan semua courses.

#### **2. Test via Browser Console (F12):**

Buka Developer Tools (F12) → Console, lalu jalankan:

```javascript
// Get all courses
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => console.log(data));

// Register user
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'student'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### **Metode 2: Via Aplikasi Web**

1. Buka browser: **http://localhost:3000**
2. Aplikasi akan otomatis menggunakan API endpoints
3. Semua fitur (login, register, courses, dll) menggunakan API

---

### **Metode 3: Via Postman atau cURL**

#### **Menggunakan cURL (Command Line):**

```bash
# Get all courses
curl http://localhost:3000/api/courses

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123\",\"role\":\"student\"}"

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"123\",\"role\":\"student\"}"
```

#### **Menggunakan Postman:**

1. Install Postman: https://www.postman.com/downloads/
2. Buat request baru:
   - Method: `GET`
   - URL: `http://localhost:3000/api/courses`
   - Klik "Send"
3. Lihat response JSON

---

### **Metode 4: Via File test-api.html**

1. Pastikan server berjalan
2. Buka file `test-api.html` di browser
3. Klik tombol-tombol untuk test API
4. Lihat hasil di bagian "Result"

---

## 📋 Daftar API Endpoints yang Tersedia

### **🔐 Authentication**
```
POST http://localhost:3000/api/auth/register
POST http://localhost:3000/api/auth/login
```

### **📚 Courses**
```
GET    http://localhost:3000/api/courses
GET    http://localhost:3000/api/courses/:id
POST   http://localhost:3000/api/courses (Admin only)
PUT    http://localhost:3000/api/courses/:id (Admin only)
DELETE http://localhost:3000/api/courses/:id (Admin only)
```

### **🎓 Enrollment**
```
POST http://localhost:3000/api/courses/:id/enroll (Student only)
```

### **👨‍🎓 Student Data**
```
GET http://localhost:3000/api/students/:id/courses
GET http://localhost:3000/api/students/:id/assignments
```

### **📝 Assignments**
```
POST http://localhost:3000/api/assignments (Student only)
PUT  http://localhost:3000/api/assignments/:id (Student only)
GET  http://localhost:3000/api/assignments/:id
```

---

## 🧪 Contoh Test API

### **1. Test Get All Courses (Tidak Perlu Login)**

```javascript
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => {
        console.log('Courses:', data.courses);
        console.log('Total:', data.courses.length);
    });
```

**Expected Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "...",
      "category": "programming",
      "duration": 40
    }
  ]
}
```

### **2. Test Register User**

```javascript
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
    })
})
.then(res => res.json())
.then(data => {
    console.log('User registered:', data);
    console.log('User ID:', data.user.id);
});
```

### **3. Test Login**

```javascript
fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
    })
})
.then(res => res.json())
.then(data => {
    console.log('Login successful:', data);
    console.log('User ID:', data.user.id); // Simpan ID ini untuk auth
});
```

### **4. Test Create Course (Perlu Login sebagai Admin)**

```javascript
// Ganti 1 dengan User ID admin yang sudah login
const adminUserId = 1;

fetch('http://localhost:3000/api/courses', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminUserId}`
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

---

## ⚠️ Troubleshooting

### **Error: "Cannot GET /api/courses"**

**Penyebab:** Server belum berjalan

**Solusi:**
1. Pastikan sudah run `npm start`
2. Cek terminal apakah ada error
3. Pastikan port 3000 tidak digunakan aplikasi lain

### **Error: "Port 3000 is already in use"**

**Solusi:**
```bash
# Windows PowerShell
taskkill /F /IM node.exe

# Atau gunakan port lain
# Edit src/backend/server.ts, ganti PORT = 3000 menjadi PORT = 3001
```

### **Error: "Cannot find module"**

**Solusi:**
```bash
# Install dependencies
npm install

# Rebuild
npm run build
```

### **API Tidak Merespons**

**Cek:**
1. Server sudah berjalan? (lihat terminal)
2. URL benar? (`http://localhost:3000/api/...`)
3. Method benar? (GET, POST, PUT, DELETE)
4. Headers benar? (Content-Type, Authorization)

---

## 🔄 Development Mode (Auto-reload)

Untuk development dengan auto-reload saat ada perubahan:

```bash
npm run dev
```

Server akan otomatis restart saat file diubah.

---

## 📝 Checklist

- [ ] Dependencies terinstall: `npm install`
- [ ] Build aplikasi: `npm run build`
- [ ] Server berjalan: `npm start`
- [ ] Lihat pesan: "API endpoints available at http://localhost:3000/api"
- [ ] Test API: Buka `http://localhost:3000/api/courses` di browser

---

## ✅ Verifikasi API Berjalan

### **Cara Cepat:**

1. Buka browser
2. Akses: `http://localhost:3000/api/courses`
3. Jika melihat JSON dengan data courses → ✅ API berjalan!
4. Jika error → ❌ Cek server sudah berjalan

---

## 🎯 Quick Start

```bash
# 1. Install (jika belum)
npm install

# 2. Build
npm run build

# 3. Start
npm start

# 4. Test di browser
# Buka: http://localhost:3000/api/courses
```

---

**API endpoints sekarang bisa diakses! 🚀**

