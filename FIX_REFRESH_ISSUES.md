# 🔧 Fix: Masalah Refresh - Kembali ke Home & Course Hilang

## ❌ Masalah

1. **Setelah refresh dari Admin Panel, kembali ke Home Page**
2. **Course baru yang ditambahkan hilang setelah refresh**

---

## ✅ Solusi

### **Masalah 1: Kembali ke Home Setelah Refresh**

**Sudah diperbaiki di `src/frontend/app.ts`:**

Sekarang saat refresh, aplikasi akan:
- ✅ Cek apakah user sudah login
- ✅ Jika admin → langsung ke Admin Dashboard
- ✅ Jika student → langsung ke Student Dashboard
- ✅ Jika belum login → ke Home Page

### **Masalah 2: Course Hilang Setelah Refresh**

**Penyebab:** Server belum menggunakan file storage dengan benar.

**Solusi:** Restart server dengan kode baru.

---

## 🚀 Langkah-langkah Perbaikan

### **Langkah 1: Rebuild Frontend**

```bash
npm run build:frontend
```

**Atau rebuild semua:**

```bash
npm run build
```

### **Langkah 2: Restart Server**

**PENTING:** Server HARUS di-restart!

```bash
# Stop server (Ctrl+C)
npm start
```

**Pastikan melihat pesan:**
```
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
📊 Loaded: X users, Y courses, ...
```

### **Langkah 3: Test**

1. **Login sebagai Admin**
2. **Buka Admin Dashboard**
3. **Tambah Course Baru**
4. **Refresh Browser (F5)**
   - ✅ Masih di Admin Dashboard (tidak kembali ke home)
   - ✅ Course masih ada!

---

## 🔍 Verifikasi

### **Cek 1: Folder data/ Terbuat**

Setelah server start, cek:
```bash
dir data
```

**File yang harus ada:**
- `courses.json`
- `users.json`
- `enrollments.json`
- `assignments.json`
- `counters.json`

### **Cek 2: Course Tersimpan**

1. Tambah course baru
2. Buka file `data/courses.json`
3. ✅ Course baru harus ada di file!

### **Cek 3: Refresh Test**

1. Di Admin Dashboard
2. Refresh browser (F5)
3. ✅ Masih di Admin Dashboard
4. ✅ Course masih ada

---

## 📝 Perubahan yang Dilakukan

### **1. Frontend (`src/frontend/app.ts`)**

**Sebelum:**
```typescript
function initializeApp(): void {
    showPage('homePage'); // Selalu ke home
}
```

**Sesudah:**
```typescript
function initializeApp(): void {
    // Jika user sudah login, redirect ke halaman yang sesuai
    if (currentUser) {
        if (currentUser.role === 'student') {
            showPage('studentDashboard');
        } else if (currentUser.role === 'admin') {
            showPage('adminDashboard');
        } else {
            showPage('homePage');
        }
    } else {
        showPage('homePage');
    }
}
```

### **2. Backend (Sudah menggunakan file storage)**

- ✅ Data disimpan ke file JSON
- ✅ Data dimuat dari file saat server start
- ✅ Data persisten (tidak hilang)

---

## ⚠️ Troubleshooting

### **Masalah: Masih Kembali ke Home**

**Cek:**
1. Frontend sudah di-rebuild? (`npm run build:frontend`)
2. Browser cache? (Ctrl+Shift+R untuk hard refresh)
3. `currentUser` ada di localStorage? (F12 → Application → Local Storage)

### **Masalah: Course Masih Hilang**

**Cek:**
1. Server sudah di-restart? (Harus restart setelah rebuild)
2. Folder `data/` terbuat?
3. File `courses.json` ada isinya?
4. Console server menunjukkan "💾 Data storage: File-based"?

### **Masalah: Folder data/ Tidak Terbuat**

**Solusi:**
1. Stop server (Ctrl+C)
2. `npm run build`
3. `npm start`
4. Cek folder `data/` terbuat

---

## ✅ Checklist

- [ ] Rebuild frontend: `npm run build:frontend`
- [ ] Rebuild backend: `npm run build:backend` (atau `npm run build`)
- [ ] Restart server: `npm start`
- [ ] Lihat pesan: "💾 Data storage: File-based (persistent)"
- [ ] Folder `data/` terbuat
- [ ] Login sebagai Admin
- [ ] Buka Admin Dashboard
- [ ] Tambah course baru
- [ ] Refresh browser (F5)
- [ ] ✅ Masih di Admin Dashboard
- [ ] ✅ Course masih ada!

---

## 🎯 Quick Fix

```bash
# 1. Rebuild semua
npm run build

# 2. Restart server (PENTING!)
npm start

# 3. Pastikan melihat: "💾 Data storage: File-based (persistent)"

# 4. Test: Login → Admin Dashboard → Tambah Course → Refresh
# ✅ Masih di Admin Dashboard & Course masih ada!
```

---

**Kedua masalah sudah diperbaiki! Rebuild dan restart server sekarang! 🚀**

