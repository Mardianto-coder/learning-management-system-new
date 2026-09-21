# 🚀 Cara Menggunakan Server yang Dioptimalkan

## 📋 Langkah-Langkah

### **1. Install Dependencies Baru**

```bash
npm install
```

Ini akan menginstall semua dependencies baru:
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `compression` - Response compression

### **2. Pilih Metode Implementasi**

#### **Opsi A: Ganti server.ts dengan server-optimized.ts**

1. Backup `server.ts`:
```bash
cp src/backend/server.ts src/backend/server.ts.backup
```

2. Ganti dengan server-optimized:
```bash
cp src/backend/server-optimized.ts src/backend/server.ts
```

3. Update `package.json`:
```json
{
  "main": "dist/backend/backend/server.js"
}
```

#### **Opsi B: Gunakan server-optimized.ts langsung**

1. Update `package.json`:
```json
{
  "main": "dist/backend/backend/server-optimized.js",
  "scripts": {
    "start": "npm run build && node dist/backend/backend/server-optimized.js"
  }
}
```

2. Update `tsconfig.backend.json` untuk include file baru:
```json
{
  "include": ["src/backend/**/*.ts"]
}
```

### **3. Build Project**

```bash
npm run build
```

### **4. Start Server**

```bash
npm start
```

---

## ⚠️ Catatan Penting

### **Password Migration**

**PENTING:** User yang sudah ada dengan password plain text tidak akan bisa login!

**Solusi:**

1. **Option 1: Register ulang semua user**
   - Hapus `data/users.json`
   - User register ulang dengan password baru

2. **Option 2: Migrate password (untuk development)**
   - Buat script untuk hash password yang ada
   - Update `data/users.json`

**Script Migration (contoh):**
```typescript
import bcrypt from 'bcrypt';
import fs from 'fs';

const users = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));

for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
        // Password belum di-hash
        user.password = await bcrypt.hash(user.password, 10);
    }
}

fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
```

### **Frontend Update**

Frontend API sudah diupdate untuk menggunakan JWT:
- ✅ Token disimpan otomatis
- ✅ Tidak perlu pass `userId` lagi
- ✅ Semua fungsi sudah kompatibel

**Tidak perlu perubahan di frontend code!**

---

## 🧪 Testing

### **1. Test Register**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **2. Test Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **3. Test Authenticated Request**

```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **4. Test Rate Limiting**

Coba login 6 kali dalam 15 menit - request ke-6 harus di-block.

---

## 🔍 Verifikasi

### **Check Password Hashing:**

1. Register user baru
2. Check `data/users.json`
3. Password harus terlihat seperti: `$2b$10$...` (bcrypt hash)

### **Check JWT Token:**

1. Login
2. Check browser console → localStorage
3. Harus ada `authToken` dengan JWT token

### **Check Security Headers:**

```bash
curl -I http://localhost:3000/api/courses
```

Harus ada headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: ...`

### **Check Compression:**

```bash
curl -H "Accept-Encoding: gzip" -I http://localhost:3000/api/courses
```

Harus ada:
- `Content-Encoding: gzip`

---

## 🐛 Troubleshooting

### **Error: Cannot find module 'bcrypt'**

```bash
npm install bcrypt
```

### **Error: JWT secret not found**

Set environment variable atau gunakan default:
```bash
export JWT_SECRET=your-secret-key
```

### **Error: Rate limit exceeded**

Tunggu 15 menit atau restart server untuk reset rate limit.

### **Password tidak match setelah update**

User perlu register ulang atau migrate password (lihat di atas).

---

## ✅ Checklist

- [ ] Install dependencies baru
- [ ] Pilih metode implementasi (A atau B)
- [ ] Build project
- [ ] Start server
- [ ] Test register
- [ ] Test login
- [ ] Test authenticated request
- [ ] Verify password hashing
- [ ] Verify JWT token
- [ ] Verify security headers
- [ ] Verify compression

---

**Server sekarang lebih aman dan optimal! 🎉**

