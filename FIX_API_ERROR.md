# 🔧 Fix Error: "Cannot GET /api/course"

## ❌ Masalah

Error: **"Cannot GET /api/course"**

**Penyebab:** URL yang diakses salah!

---

## ✅ Solusi

### **URL yang SALAH:**
```
http://localhost:3000/api/course  ❌
```

### **URL yang BENAR:**
```
http://localhost:3000/api/courses  ✅ (dengan 's' di akhir)
```

---

## 🎯 Cara Mengakses API yang Benar

### **1. Get All Courses:**
```
http://localhost:3000/api/courses
```
**Note:** `courses` (plural, dengan 's')

### **2. Get Course by ID:**
```
http://localhost:3000/api/courses/1
```
**Note:** `courses/1` (bukan `course/1`)

### **3. Endpoint Lainnya:**
- ✅ `/api/courses` (plural)
- ✅ `/api/courses/:id`
- ✅ `/api/courses/:id/enroll`
- ❌ `/api/course` (singular - TIDAK ADA)

---

## 🚀 Langkah-langkah

### **1. Pastikan Server Berjalan**

Buka terminal dan jalankan:
```bash
npm start
```

Anda harus melihat:
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
```

### **2. Akses URL yang Benar**

Buka browser dan akses:
```
http://localhost:3000/api/courses
```

**Bukan:**
```
http://localhost:3000/api/course  ❌
```

### **3. Hasil yang Diharapkan**

Anda akan melihat JSON response:
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "...",
      "category": "programming",
      "duration": 40
    }
  ]
}
```

---

## 📋 Daftar Endpoint yang Benar

### **Authentication:**
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`

### **Courses (PLURAL!):**
- ✅ `GET /api/courses` ← **Perhatikan 's' di akhir**
- ✅ `GET /api/courses/:id`
- ✅ `POST /api/courses`
- ✅ `PUT /api/courses/:id`
- ✅ `DELETE /api/courses/:id`

### **Enrollment:**
- ✅ `POST /api/courses/:id/enroll`

### **Student:**
- ✅ `GET /api/students/:id/courses`
- ✅ `GET /api/students/:id/assignments`

### **Assignments:**
- ✅ `POST /api/assignments`
- ✅ `PUT /api/assignments/:id`
- ✅ `GET /api/assignments/:id`

---

## 🧪 Test di Browser Console

Buka Developer Tools (F12) → Console:

```javascript
// ✅ BENAR (dengan 's')
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => console.log(data));

// ❌ SALAH (tanpa 's')
fetch('http://localhost:3000/api/course')
    .then(res => res.json())
    .then(data => console.log(data));
```

---

## ⚠️ Troubleshooting

### **Jika Masih Error:**

1. **Cek Server Berjalan:**
   ```bash
   npm start
   ```

2. **Cek Port 3000:**
   - Pastikan tidak ada aplikasi lain yang menggunakan port 3000
   - Jika port terpakai, stop dengan: `taskkill /F /IM node.exe`

3. **Rebuild Aplikasi:**
   ```bash
   npm run build
   npm start
   ```

4. **Cek URL:**
   - Pastikan menggunakan `/api/courses` (dengan 's')
   - Bukan `/api/course` (tanpa 's')

---

## ✅ Checklist

- [ ] Server berjalan: `npm start`
- [ ] URL benar: `http://localhost:3000/api/courses` (dengan 's')
- [ ] Browser menampilkan JSON response
- [ ] Tidak ada error di terminal

---

## 🎯 Quick Fix

**Ganti URL di browser dari:**
```
http://localhost:3000/api/course  ❌
```

**Menjadi:**
```
http://localhost:3000/api/courses  ✅
```

**Selesai!** 🎉

