# Quick Login Guide

## 🎯 Cara Cepat Login

### 1. Buka Aplikasi
```
http://localhost:3000
```

### 2. Klik "Login" 
- Di pojok kanan atas navbar

### 3. Pilih Tab "Register" (jika belum punya akun)
- Isi: Name, Email, Password
- **Pilih Role:** Student atau Admin
- Klik "Register"

### 4. Login
- Isi: Email, Password
- **Pilih Role:** Student atau Admin (harus sama dengan saat register)
- Klik "Login"

## 📍 Lokasi File

| Komponen | File | Baris |
|----------|------|-------|
| Tombol Login | `index.html` | 21 |
| Modal Login | `index.html` | 28-86 |
| Login Form | `index.html` | 38-57 |
| Register Form | `index.html` | 60-83 |
| Login Logic | `src/frontend/app.ts` | 151-187 |
| Register Logic | `src/frontend/app.ts` | 189-210 |
| Login API | `src/backend/server.ts` | 135-154 |
| Register API | `src/backend/server.ts` | 100-133 |

## 🔑 Contoh Credentials

**Student:**
- Email: `student@test.com`
- Password: `123456`
- Role: `student`

**Admin:**
- Email: `admin@test.com`
- Password: `123456`
- Role: `admin`

## ⚡ Quick Steps

1. **Register dulu** → Tab Register → Isi form → Pilih Role → Submit
2. **Login** → Tab Login → Isi email/password → Pilih Role → Submit
3. **Dashboard** → Otomatis redirect sesuai role

