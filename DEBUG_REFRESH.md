# 🔍 Debug: Data Hilang Saat Refresh Browser

## 📋 Langkah Debugging

### **1. Cek Console Server**

Saat refresh browser, cek terminal server - harus muncul:
```
[API] GET /api/courses - Returning X courses
```

**Jika tidak muncul:**
- ⚠️ Request tidak sampai ke server
- ⚠️ Cek apakah server masih berjalan

**Jika muncul tapi X = 0:**
- ⚠️ Data tidak ada di memory
- ⚠️ Data tidak dimuat dari file saat startup

### **2. Cek Console Browser**

Buka Developer Tools (F12) → Console, harus muncul:
```
[App] Loading courses from API...
[App] Courses loaded: X courses
```

**Jika tidak muncul:**
- ⚠️ `loadCourses()` tidak dipanggil
- ⚠️ Ada masalah dengan initialization

**Jika muncul error:**
- ⚠️ API call gagal
- ⚠️ Cek error message

### **3. Cek Network Tab**

Buka Developer Tools (F12) → Network:
1. Refresh page (F5)
2. Cari request ke `/api/courses`
3. Klik request tersebut
4. Tab **Response** - lihat apakah data lengkap?

**Jika status bukan 200:**
- ⚠️ Ada error di server
- ⚠️ Cek console server untuk error

**Jika response kosong:**
- ⚠️ Server mengembalikan data kosong
- ⚠️ Data tidak ada di memory server

---

## 🧪 Test Manual

### **Test 1: Tambah Course dan Cek Log**

1. Tambah course baru via aplikasi
2. Cek console server - harus muncul:
   ```
   [API] POST /api/courses - Course created: [title] (ID: X)
   [API] Total courses in memory: X
   ```

3. Cek file `data/courses.json` - course baru harus ada

### **Test 2: Refresh Browser dan Cek Log**

1. Refresh browser (F5)
2. Cek console server - harus muncul:
   ```
   [API] GET /api/courses - Returning X courses
   ```

3. Cek console browser - harus muncul:
   ```
   [App] Loading courses from API...
   [App] Courses loaded: X courses
   ```

### **Test 3: Test API Langsung**

Di browser console, jalankan:
```javascript
fetch('http://localhost:3000/api/courses')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Courses count:', data.courses.length);
    console.log('Courses:', data.courses);
  });
```

**Harus muncul semua courses yang ada di file!**

---

## 🔧 Fix Berdasarkan Hasil Debug

### **Jika Logging Tidak Muncul:**

**Server tidak menerima request:**
- Cek apakah server masih berjalan
- Cek apakah port 3000 benar
- Cek CORS configuration

### **Jika API Mengembalikan Data Kosong:**

**Data tidak ada di memory:**
- Restart server untuk load data dari file
- Cek apakah data dimuat saat startup:
  ```
  📊 Loaded: X users, Y courses, ...
  ✅ Data loaded successfully
  ```

### **Jika Frontend Tidak Memuat Data:**

**API call gagal:**
- Cek Network tab untuk error
- Cek console browser untuk error
- Cek CORS atau network issues

---

## ✅ Expected Behavior

### **Saat Menambah Course:**
```
Server Console:
[API] POST /api/courses - Course created: [title] (ID: X)
[API] Total courses in memory: X

File: data/courses.json - course baru ada ✅
```

### **Saat Refresh Browser:**
```
Server Console:
[API] GET /api/courses - Returning X courses

Browser Console:
[App] Loading courses from API...
[App] Courses loaded: X courses

UI: Semua courses ditampilkan ✅
```

---

## 🎯 Next Steps

Setelah menambahkan logging, lakukan test:

1. **Tambah course baru**
2. **Cek console server** - harus ada log
3. **Cek file** - course harus ada
4. **Refresh browser**
5. **Cek console server** - harus ada log GET request
6. **Cek console browser** - harus ada log loading
7. **Cek UI** - courses harus ditampilkan

**Jika masih ada masalah, kirimkan output dari console server dan browser!**

