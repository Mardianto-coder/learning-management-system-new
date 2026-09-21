# 🔧 Fix: Data Masih Hilang - Solusi Lengkap

## ❌ Masalah

**Course baru yang ditambahkan masih hilang setelah refresh.**

**Penyebab:** Path file storage salah, jadi data tidak tersimpan ke lokasi yang benar.

---

## ✅ Solusi: Path Sudah Diperbaiki

Path file storage sudah diperbaiki:
- **Sebelum:** `../../data` (salah - ke `dist/data/`)
- **Sesudah:** `../../../data` (benar - ke root `data/`)

---

## 🚀 Langkah-langkah (PENTING!)

### **Langkah 1: Stop Server**

**PENTING:** Server HARUS di-stop dulu!

Di terminal tempat server berjalan, tekan:
```
Ctrl + C
```

### **Langkah 2: Rebuild Backend**

```bash
npm run build:backend
```

**Atau rebuild semua:**

```bash
npm run build
```

### **Langkah 3: Start Server**

```bash
npm start
```

**Output yang HARUS muncul:**
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
📊 Loaded: X users, Y courses, ...
```

### **Langkah 4: Verifikasi Folder data/**

Setelah server start, cek:
```bash
dir data
```

**File yang harus ada:**
- `courses.json` ✅
- `users.json` ✅
- `enrollments.json` ✅
- `assignments.json` ✅
- `counters.json` ✅

### **Langkah 5: Test Tambah Course**

1. **Login sebagai Admin**
2. **Buka Admin Dashboard**
3. **Tambah Course Baru:**
   - Klik "Add New Course"
   - Isi form
   - Klik "Create"
4. **Cek File:**
   - Buka folder `data/`
   - Buka file `courses.json`
   - ✅ **Course baru harus ada di file!**
5. **Refresh Browser (F5):**
   - ✅ Masih di Admin Dashboard
   - ✅ Course masih ada!

---

## 🔍 Verifikasi Data Tersimpan

### **Cara 1: Cek File Langsung**

```bash
# Di PowerShell
Get-Content data\courses.json
```

**Atau buka di File Explorer:**
```
E:\LMS Platfrom\data\courses.json
```

### **Cara 2: Cek via API**

Buka browser console (F12) dan jalankan:

```javascript
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => {
        console.log('Total courses:', data.courses.length);
        console.log('Courses:', data.courses);
    });
```

---

## ⚠️ Troubleshooting

### **Masalah 1: File courses.json Tidak Terbuat**

**Penyebab:** Server belum di-restart dengan kode baru

**Solusi:**
1. Stop server (Ctrl+C)
2. `npm run build:backend`
3. `npm start`
4. Folder `data/` akan terbuat otomatis

### **Masalah 2: Data Masih Hilang**

**Cek:**
1. File `courses.json` ada isinya?
2. Server sudah di-restart setelah rebuild?
3. Console server menunjukkan "💾 Data storage"?

**Test:**
1. Tambah course baru
2. **SEGERA** cek file `courses.json`
3. Course baru harus ada di file!

### **Masalah 3: Pesan "💾 Data storage" Tidak Muncul**

**Penyebab:** Server masih menggunakan file lama

**Solusi:**
1. Hapus folder `dist/` (opsional)
2. `npm run build`
3. `npm start`

---

## 📝 Checklist Lengkap

- [ ] **Stop server** (Ctrl+C)
- [ ] **Rebuild backend:** `npm run build:backend`
- [ ] **Start server:** `npm start`
- [ ] **Lihat pesan:** "💾 Data storage: File-based (persistent)"
- [ ] **Folder `data/` terbuat**
- [ ] **File `courses.json` ada**
- [ ] **Login sebagai Admin**
- [ ] **Tambah course baru**
- [ ] **Cek file `courses.json`** - course baru ada!
- [ ] **Refresh browser (F5)**
- [ ] ✅ **Masih di Admin Dashboard**
- [ ] ✅ **Course masih ada!**

---

## 🎯 Quick Fix

```bash
# 1. Stop server (Ctrl+C) - PENTING!

# 2. Rebuild
npm run build:backend

# 3. Start
npm start

# 4. Pastikan melihat:
#    "💾 Data storage: File-based (persistent)"
#    "📁 Data files: ./data/"
#    "📊 Loaded: ..."

# 5. Test: Tambah course → Cek courses.json → Refresh
```

---

## 💡 Catatan Penting

### **Server HARUS di-restart!**

Kode sudah diperbaiki, tapi server yang lama masih berjalan dengan kode lama.

**Solusi:** Stop dan start server lagi.

### **Cek File Setelah Tambah Course**

Setelah tambah course baru:
1. **SEGERA** buka file `data/courses.json`
2. Course baru harus ada di file!
3. Jika tidak ada, berarti ada masalah dengan save

---

## ✅ Verifikasi Akhir

### **Test Lengkap:**

1. **Restart Server:**
   ```bash
   npm start
   ```

2. **Login sebagai Admin**

3. **Tambah Course:**
   - Title: "Test Course"
   - Description: "Test"
   - Category: "programming"
   - Duration: 40

4. **Cek File:**
   ```bash
   Get-Content data\courses.json
   ```
   - ✅ Course "Test Course" harus ada!

5. **Refresh Browser:**
   - ✅ Masih di Admin Dashboard
   - ✅ Course "Test Course" masih ada!

---

**Path sudah diperbaiki! Restart server sekarang dan test! 🚀**

