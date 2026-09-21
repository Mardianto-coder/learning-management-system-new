# Panduan Login sebagai Student/Admin

## 📍 Dimana Letak Login?

### 1. **Tombol Login di Navbar (Atas Halaman)**
- **Lokasi:** Bagian atas halaman, di navigation bar
- **Tampilan:** Link "Login" di pojok kanan atas
- **File:** `index.html` baris 21

```html
<a href="#" class="nav-link" id="loginLink">Login</a>
```

### 2. **Modal Login/Register**
- **Lokasi:** Muncul sebagai popup/modal saat klik tombol "Login"
- **File:** `index.html` baris 28-86
- **Fitur:** 
  - Tab "Login" dan "Register"
  - Form dengan dropdown untuk memilih Role (Student/Admin)

## 🚀 Cara Login

### Langkah 1: Buka Aplikasi
1. Pastikan server berjalan: `npm start`
2. Buka browser: `http://localhost:3000`

### Langkah 2: Klik Tombol Login
- Klik tombol **"Login"** di navbar (pojok kanan atas)

### Langkah 3: Isi Form Login
Form login akan muncul dengan field:
- **Email:** Masukkan email yang sudah terdaftar
- **Password:** Masukkan password
- **Role:** Pilih **"Student"** atau **"Admin"** dari dropdown

### Langkah 4: Submit
- Klik tombol **"Login"**
- Jika berhasil, akan redirect ke:
  - **Student** → Student Dashboard
  - **Admin** → Admin Dashboard

## 📝 Cara Register (Membuat Akun Baru)

### Langkah 1: Buka Modal Login
- Klik tombol **"Login"** di navbar

### Langkah 2: Pilih Tab Register
- Klik tab **"Register"** di modal

### Langkah 3: Isi Form Register
- **Name:** Nama lengkap
- **Email:** Email yang akan digunakan
- **Password:** Password untuk login
- **Role:** Pilih **"Student"** atau **"Admin"**

### Langkah 4: Submit
- Klik tombol **"Register"**
- Setelah berhasil, akan otomatis switch ke tab Login
- Login dengan email dan password yang baru dibuat

## 🎯 Contoh Login

### Login sebagai Student:
```
Email: student@example.com
Password: password123
Role: Student
```

### Login sebagai Admin:
```
Email: admin@example.com
Password: password123
Role: Admin
```

## 📂 Lokasi File Login

### 1. **UI/HTML (Frontend)**
- **File:** `index.html`
- **Lokasi:** 
  - Navbar Login Link: Baris 21
  - Login Modal: Baris 28-86
  - Login Form: Baris 38-57
  - Register Form: Baris 60-83

### 2. **JavaScript Logic (Frontend)**
- **File:** `src/frontend/app.ts`
- **Fungsi Login:** `handleLogin()` - Baris 151-187
- **Fungsi Register:** `handleRegister()` - Baris 189-210
- **Event Listener:** `setupEventListeners()` - Baris 31-81

### 3. **Backend API**
- **File:** `src/backend/server.ts`
- **Login Endpoint:** `POST /api/auth/login` - Baris 135-154
- **Register Endpoint:** `POST /api/auth/register` - Baris 100-133

### 4. **Type Definitions**
- **File:** `src/types/index.ts`
- **User Interface:** Baris 5-12
- **UserRole Type:** Baris 3

## 🔐 Authentication Flow

```
1. User klik "Login" di navbar
   ↓
2. Modal muncul dengan form login
   ↓
3. User isi email, password, dan pilih role
   ↓
4. Frontend kirim request ke: POST /api/auth/login
   ↓
5. Backend validasi credentials
   ↓
6. Jika valid, return user data
   ↓
7. Frontend simpan di localStorage
   ↓
8. Redirect ke dashboard sesuai role
```

## 🎨 Tampilan Login

### Modal Login memiliki:
- **2 Tab:** Login dan Register
- **Form Fields:**
  - Email (input type="email")
  - Password (input type="password")
  - Role (dropdown select)
- **Submit Button:** "Login" atau "Register"

### Setelah Login:
- Tombol "Login" hilang
- Tombol "Logout" muncul
- Menu sesuai role muncul:
  - **Student:** "Dashboard" link
  - **Admin:** "Admin Panel" link

## ⚠️ Troubleshooting

### Login tidak berfungsi?
1. **Cek server berjalan:** Pastikan `npm start` sudah dijalankan
2. **Cek email/password:** Pastikan sudah register terlebih dahulu
3. **Cek role:** Pastikan role yang dipilih sesuai dengan yang didaftarkan
4. **Cek browser console:** Tekan F12, lihat error di Console tab

### Tidak bisa register?
1. **Email sudah digunakan:** Gunakan email yang berbeda
2. **Field kosong:** Pastikan semua field terisi
3. **Role tidak dipilih:** Pastikan memilih Student atau Admin

### Lupa password?
- Saat ini belum ada fitur reset password
- Harus register akun baru dengan email berbeda

## 📋 Quick Test

### Test Register Student:
```javascript
// Di browser console (F12)
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Student',
    email: 'student@test.com',
    password: '123456',
    role: 'student'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Test Login:
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@test.com',
    password: '123456',
    role: 'student'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🎓 Perbedaan Student vs Admin

### Student:
- Bisa enroll ke courses
- Bisa submit assignments
- Bisa lihat progress
- **Dashboard:** Menampilkan enrolled courses dan assignments

### Admin:
- Bisa create/edit/delete courses
- Bisa manage semua courses
- **Dashboard:** Menampilkan course management panel

## 📝 Catatan Penting

1. **Data tersimpan di memory:** Saat server restart, semua user hilang
2. **Password tidak di-hash:** Untuk production, perlu hashing (bcrypt)
3. **Authentication sederhana:** Menggunakan User ID sebagai token
4. **Session:** Disimpan di localStorage browser

