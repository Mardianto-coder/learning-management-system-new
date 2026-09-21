# 🔧 Fix: Data Masih Hilang di Admin Dashboard

## ❌ Masalah

**Course yang ditambahkan di Admin Dashboard hilang saat refresh.**

**Penyebab:** Server belum menggunakan file storage dengan benar.

---

## ✅ Solusi: Restart Server dengan Kode Baru

### **Langkah 1: Stop Server yang Sedang Berjalan**

Di terminal tempat server berjalan, tekan:
```
Ctrl + C
```

### **Langkah 2: Rebuild Aplikasi**

```bash
npm run build
```

**Pastikan tidak ada error!**

### **Langkah 3: Start Server Lagi**

```bash
npm start
```

**Output yang diharapkan:**
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
📊 Loaded: X users, Y courses, Z enrollments, W assignments
```

### **Langkah 4: Verifikasi Folder data/ Terbuat**

Setelah server start, cek apakah folder `data/` sudah terbuat:

```bash
# Di PowerShell
dir data
```

Atau cek di File Explorer:
```
E:\LMS Platfrom\data\
```

**File yang harus ada:**
- `courses.json`
- `users.json`
- `enrollments.json`
- `assignments.json`
- `counters.json`

---

## 🧪 Test: Pastikan Data Tersimpan

### **Test 1: Tambah Course**

1. Login sebagai Admin
2. Admin Dashboard → Add Course
3. Isi form dan Create
4. ✅ Course muncul di list

### **Test 2: Cek File**

1. Buka folder `data/`
2. Buka file `courses.json`
3. ✅ Course baru harus ada di file!

### **Test 3: Refresh Browser**

1. Tekan F5 atau Ctrl+R
2. ✅ Course masih ada!

### **Test 4: Restart Server**

1. Stop server (Ctrl+C)
2. Start lagi: `npm start`
3. Refresh browser
4. ✅ Course masih ada!

---

## 🔍 Troubleshooting

### **Masalah 1: Folder data/ Tidak Terbuat**

**Penyebab:** Server belum di-restart dengan kode baru

**Solusi:**
1. Stop server (Ctrl+C)
2. `npm run build`
3. `npm start`
4. Cek folder `data/` sudah terbuat

### **Masalah 2: File courses.json Kosong**

**Penyebab:** Data belum pernah disimpan

**Solusi:**
1. Tambah course baru via Admin Dashboard
2. Cek file `courses.json` - harus ada course baru

### **Masalah 3: Data Masih Hilang**

**Cek:**
1. Server sudah restart? (harus restart setelah rebuild)
2. File `courses.json` ada isinya?
3. Console server menunjukkan "💾 Data storage: File-based"?

### **Masalah 4: Error "Cannot find module 'data-storage'"**

**Solusi:**
```bash
npm run build
npm start
```

---

## 📝 Checklist

- [ ] Server di-stop (Ctrl+C)
- [ ] Rebuild: `npm run build`
- [ ] Start server: `npm start`
- [ ] Lihat pesan: "💾 Data storage: File-based (persistent)"
- [ ] Folder `data/` terbuat
- [ ] File `courses.json` ada
- [ ] Tambah course baru
- [ ] Cek `courses.json` - course baru ada
- [ ] Refresh browser
- [ ] ✅ Course masih ada!

---

## 🎯 Quick Fix

```bash
# 1. Stop server (Ctrl+C di terminal server)

# 2. Rebuild
npm run build

# 3. Start
npm start

# 4. Test: Tambah course → Refresh → Course masih ada!
```

---

## 💡 Catatan Penting

### **Server HARUS di-restart!**

Kode file storage sudah di-compile, tapi server yang lama masih berjalan dengan kode lama (in-memory).

**Solusi:** Stop dan start server lagi.

### **Cek Console Server**

Saat server start, harus ada pesan:
```
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
📊 Loaded: X users, Y courses, ...
```

Jika tidak ada pesan ini, berarti server masih menggunakan kode lama.

---

## ✅ Verifikasi

### **Cara Cek Apakah Sudah Benar:**

1. **Cek Console Server:**
   - Harus ada: "💾 Data storage: File-based (persistent)"

2. **Cek Folder data/:**
   - Folder harus ada
   - File JSON harus ada

3. **Test Tambah Course:**
   - Tambah course baru
   - Cek file `courses.json`
   - Course baru harus ada di file

4. **Test Refresh:**
   - Refresh browser
   - Course masih ada

---

**Restart server sekarang dan test! Data tidak akan hilang lagi! 🚀**

