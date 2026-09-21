# 🔧 Fix: "No authen" Error dan Course Hilang Setelah Refresh

## ❌ Masalah

1. **Error "No authen"** muncul di Admin Dashboard
2. **Course baru yang ditambahkan hilang** setelah refresh

---

## 🔍 Penyebab

### **1. Server Masih Menggunakan Versi Lama**

Server yang berjalan masih menggunakan `server.ts` (lama) yang:
- ❌ Tidak support JWT authentication
- ❌ Masih menggunakan user ID untuk authentication
- ❌ Menggunakan synchronous file storage

### **2. Frontend Sudah Diupdate**

Frontend sudah diupdate untuk menggunakan:
- ✅ JWT token authentication
- ✅ Token disimpan di localStorage

**Konflik:** Frontend mengirim JWT token, tapi server masih expect user ID!

---

## ✅ Solusi

### **Langkah 1: Update package.json**

Sudah diupdate untuk menggunakan `server-optimized.js`:
```json
{
  "main": "dist/backend/backend/server-optimized.js",
  "scripts": {
    "start": "npm run build && node dist/backend/backend/server-optimized.js"
  }
}
```

### **Langkah 2: Install Dependencies**

Pastikan semua dependencies sudah terinstall:
```bash
npm install
```

### **Langkah 3: Build Project**

```bash
npm run build
```

### **Langkah 4: RESTART SERVER**

**PENTING:** Server HARUS di-restart!

1. **Stop server yang sedang berjalan:**
   - Di terminal tempat server berjalan, tekan: `Ctrl + C`

2. **Start server baru:**
   ```bash
   npm start
   ```

### **Langkah 5: Login Ulang**

Karena server sekarang menggunakan JWT:
1. **Logout** dari aplikasi
2. **Login kembali** - token JWT akan di-generate dan disimpan
3. **Coba create course** - seharusnya berhasil tanpa error

---

## 🔄 Migration Data

### **Password Migration**

**PENTING:** User yang sudah ada dengan password plain text tidak akan bisa login!

**Solusi:**

1. **Option 1: Register Ulang (Recommended)**
   - Hapus `data/users.json`
   - User register ulang dengan password baru
   - Password akan otomatis di-hash

2. **Option 2: Migrate Password (Development Only)**
   ```typescript
   // Script untuk migrate password
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

---

## ✅ Verifikasi

### **1. Check Server Logs**

Setelah start server, harus muncul:
```
🚀 Server is running on http://localhost:3000
📡 API endpoints available at http://localhost:3000/api
💾 Data storage: File-based (persistent, async)
📁 Data files: ./data/
🔒 Security: Enabled (JWT, Rate Limiting, Input Validation)
```

### **2. Check Authentication**

1. Login sebagai admin
2. Check browser console → localStorage
3. Harus ada:
   - `currentUser` - User object
   - `authToken` - JWT token

### **3. Test Create Course**

1. Login sebagai admin
2. Klik "+ Add New Course"
3. Isi form dan submit
4. **Tidak ada error "No authen"**
5. Course berhasil dibuat
6. Refresh browser
7. **Course masih ada!** ✅

---

## 🐛 Troubleshooting

### **Error: "No authentication token found"**

**Penyebab:** Token tidak ada di localStorage

**Solusi:**
1. Logout
2. Login kembali
3. Token akan otomatis di-generate

### **Error: "Invalid or expired token"**

**Penyebab:** Token expired atau invalid

**Solusi:**
1. Logout
2. Login kembali
3. Token baru akan di-generate

### **Course Masih Hilang Setelah Refresh**

**Penyebab:**
1. Server belum di-restart
2. Server masih menggunakan versi lama
3. Data tidak tersimpan dengan benar

**Solusi:**
1. Pastikan server sudah di-restart
2. Check `data/courses.json` - course harus ada di file
3. Pastikan menggunakan `server-optimized.js`

### **Password Tidak Match**

**Penyebab:** Password lama (plain text) tidak compatible dengan bcrypt

**Solusi:**
1. Register ulang dengan password baru
2. Atau migrate password (lihat di atas)

---

## 📋 Checklist

- [ ] Dependencies sudah terinstall (`npm install`)
- [ ] Project sudah di-build (`npm run build`)
- [ ] Server sudah di-restart (stop → start)
- [ ] Login ulang untuk mendapatkan JWT token
- [ ] Test create course - tidak ada error
- [ ] Refresh browser - course masih ada
- [ ] Check `data/courses.json` - course tersimpan

---

## 🎯 Hasil Akhir

Setelah semua langkah:
- ✅ Tidak ada error "No authen"
- ✅ Course berhasil dibuat
- ✅ Course persisten setelah refresh
- ✅ Authentication menggunakan JWT
- ✅ Password di-hash dengan bcrypt
- ✅ Data tersimpan dengan async file I/O

---

**Server sekarang menggunakan versi optimized dengan JWT authentication! 🎉**

