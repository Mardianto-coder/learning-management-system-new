# 🧪 Test File Storage - Pastikan Data Tersimpan

## 🔍 Masalah: Data Masih Hilang

File `courses.json` tidak ada, berarti:
- ❌ Server belum pernah menyimpan data ke file
- ❌ Atau server belum di-restart dengan kode baru

---

## ✅ Solusi: Pastikan Server Menggunakan File Storage

### **Langkah 1: Stop Server yang Sedang Berjalan**

Di terminal tempat server berjalan, tekan:
```
Ctrl + C
```

### **Langkah 2: Pastikan File Ter-compile dengan Benar**

```bash
npm run build
```

**Pastikan tidak ada error!**

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

**Jika TIDAK ada pesan "💾 Data storage: File-based"**, berarti server masih menggunakan kode lama!

### **Langkah 4: Verifikasi Folder data/ Terbuat**

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

1. Login sebagai Admin
2. Tambah course baru
3. **Cek file `data/courses.json`** - course baru harus ada!
4. Refresh browser
5. ✅ Course masih ada!

---

## 🔍 Debugging

### **Cek 1: Apakah Server Menggunakan File Storage?**

**Cek console server saat start:**
- ✅ Harus ada: "💾 Data storage: File-based (persistent)"
- ✅ Harus ada: "📁 Data files: ./data/"
- ✅ Harus ada: "📊 Loaded: ..."

**Jika TIDAK ada**, server masih menggunakan kode lama!

### **Cek 2: Apakah Data Tersimpan?**

Setelah tambah course:
1. Buka file `data/courses.json`
2. ✅ Course baru harus ada di file!

### **Cek 3: Apakah Data Dimuat?**

Saat server start:
1. Cek console server
2. Harus ada: "📊 Loaded: X users, Y courses, ..."
3. Jika courses = 0, berarti file kosong atau tidak ada

---

## ⚠️ Troubleshooting

### **Masalah: Pesan "💾 Data storage" Tidak Muncul**

**Penyebab:** Server masih menggunakan file lama di `dist/backend/server.js`

**Solusi:**
1. Hapus folder `dist/`
2. Rebuild: `npm run build`
3. Start: `npm start`

### **Masalah: Folder data/ Tidak Terbuat**

**Penyebab:** Server belum dijalankan dengan kode baru

**Solusi:**
1. Stop server (Ctrl+C)
2. `npm run build`
3. `npm start`
4. Folder akan terbuat otomatis

### **Masalah: Data Masih Hilang**

**Cek:**
1. File `courses.json` ada isinya?
2. Server sudah di-restart setelah tambah course?
3. Console server menunjukkan "💾 Data storage"?

---

## 🎯 Quick Test

```bash
# 1. Stop server (Ctrl+C)

# 2. Hapus dist (opsional, untuk memastikan)
# Remove-Item -Recurse -Force dist

# 3. Rebuild
npm run build

# 4. Start
npm start

# 5. Pastikan melihat:
#    "💾 Data storage: File-based (persistent)"
#    "📁 Data files: ./data/"
#    "📊 Loaded: ..."

# 6. Cek folder data/
dir data

# 7. Test: Tambah course → Cek courses.json → Refresh
```

---

**Pastikan server di-restart dan melihat pesan file storage! 🚀**

