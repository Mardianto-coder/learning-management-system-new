# 🔧 Fix: Data Hilang Setelah Refresh

## 🔍 Masalah

Data baru yang ditambahkan hilang setelah refresh browser.

---

## ✅ Solusi

### **1. Pastikan Server Masih Berjalan**

**Masalah:** Jika server di-restart, data di memory hilang dan harus dimuat dari file.

**Solusi:**
- ✅ Pastikan server tetap berjalan saat refresh browser
- ✅ Jangan restart server setelah menambah data
- ✅ Data akan hilang hanya jika server di-restart

### **2. Verifikasi Data Tersimpan ke File**

**Cek apakah data benar-benar tersimpan:**

```bash
# Cek file courses.json
Get-Content data\courses.json

# Cek jumlah courses
(Get-Content data\courses.json | ConvertFrom-Json).Count
```

**Jika data ada di file tapi hilang setelah refresh:**
- ✅ Data tersimpan dengan benar
- ⚠️ Masalahnya adalah server di-restart atau data tidak dimuat dari file

### **3. Pastikan Data Dimuat dari File saat Startup**

**Cek console server saat startup:**
```
📊 Loaded: X users, Y courses, Z enrollments, W assignments
✅ Data loaded successfully
```

**Jika tidak muncul:**
- ⚠️ Data tidak dimuat dari file
- ⚠️ Server menggunakan data default

---

## 🔄 Cara Kerja Data Storage

### **1. Saat Menambah Data:**
1. Data ditambahkan ke array di memory
2. Data di-save ke file JSON (async)
3. Data tersimpan permanen di file

### **2. Saat Refresh Browser:**
1. Frontend memanggil API `/api/courses`
2. Backend mengembalikan data dari memory
3. **Data tetap ada** (karena server masih berjalan)

### **3. Saat Server Restart:**
1. Server load data dari file JSON
2. Data dimuat ke memory
3. **Data tetap ada** (karena dimuat dari file)

---

## ⚠️ Kapan Data Bisa Hilang?

### **1. Server Di-restart TANPA Save ke File**
- ❌ Jika ada error saat save
- ❌ Jika server crash sebelum save selesai
- ❌ Jika ada race condition

### **2. File Data Terhapus**
- ❌ Jika folder `data/` terhapus
- ❌ Jika file JSON terhapus

### **3. Data Tidak Di-save**
- ❌ Jika ada error di save function
- ❌ Jika async operation gagal

---

## 🧪 Test Apakah Data Tersimpan

### **Test 1: Tambah Data dan Cek File**

```bash
# 1. Tambah course baru via aplikasi
# 2. Cek file courses.json
Get-Content data\courses.json

# 3. Verifikasi course baru ada di file
```

### **Test 2: Restart Server dan Cek Data**

```bash
# 1. Stop server (Ctrl+C)
# 2. Start server lagi
npm start

# 3. Cek console - harus muncul:
# 📊 Loaded: X users, Y courses, ...
# ✅ Data loaded successfully

# 4. Cek aplikasi - data harus masih ada
```

### **Test 3: Refresh Browser**

```bash
# 1. Tambah data
# 2. Refresh browser (F5)
# 3. Data harus masih ada (karena server masih berjalan)
```

---

## 🔍 Debugging

### **1. Cek Apakah Data Tersimpan**

```bash
# Cek semua file data
Get-ChildItem data\*.json

# Cek isi courses.json
Get-Content data\courses.json | ConvertFrom-Json | Select-Object id, title
```

### **2. Cek Console Server**

Saat menambah data, harus ada log:
```
✅ Course created successfully
```

**Jika tidak ada:**
- ⚠️ Ada error saat save
- ⚠️ Check console untuk error message

### **3. Cek Network Tab di Browser**

1. Buka Developer Tools (F12)
2. Tab Network
3. Refresh page
4. Cek request ke `/api/courses`
5. Lihat response - apakah data lengkap?

---

## 🛠️ Fix Jika Data Masih Hilang

### **Fix 1: Pastikan await Save**

**Cek apakah semua save menggunakan await:**
```typescript
// ✅ BENAR
await saveCoursesAsync(courses);

// ❌ SALAH
saveCoursesAsync(courses); // Tanpa await
```

### **Fix 2: Tambahkan Error Handling**

```typescript
try {
    await saveCoursesAsync(courses);
    console.log('✅ Data saved successfully');
} catch (error) {
    console.error('❌ Error saving data:', error);
    // Retry atau handle error
}
```

### **Fix 3: Verifikasi File Path**

**Cek apakah path file benar:**
```typescript
// File harus di: E:\LMS Platfrom\data\courses.json
const DATA_DIR = path.join(__dirname, '../../../data');
```

---

## 📋 Checklist

- [ ] Server masih berjalan saat refresh browser
- [ ] Data tersimpan ke file (cek `data/courses.json`)
- [ ] Data dimuat saat server startup
- [ ] Tidak ada error di console server
- [ ] Network request berhasil (cek Developer Tools)

---

## 🎯 Kesimpulan

**Data seharusnya TIDAK hilang setelah refresh browser** jika:
- ✅ Server masih berjalan
- ✅ Data tersimpan ke file
- ✅ Tidak ada error

**Data akan hilang jika:**
- ❌ Server di-restart dan data tidak tersimpan
- ❌ File data terhapus
- ❌ Ada error saat save

**Jika data masih hilang setelah refresh:**
1. Cek apakah server masih berjalan
2. Cek apakah data ada di file
3. Cek console untuk error
4. Cek Network tab di browser

