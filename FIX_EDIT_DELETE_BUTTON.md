# 🔧 Fix: Tombol Edit dan Delete Tidak Bisa Dipilih

## ❌ Masalah

Tombol Edit dan Delete di Admin Dashboard tidak bisa diklik/dipilih.

**Penyebab:**
- Menggunakan `onclick="window.editCourse()"` yang mungkin diblokir oleh CSP (Content Security Policy)
- Event delegation yang mungkin menghalangi onclick handlers

---

## ✅ Solusi yang Diterapkan

### **1. Mengganti onclick dengan Data Attributes**

**SEBELUM:**
```html
<button onclick="window.editCourse(1)">Edit</button>
<button onclick="window.deleteCourse(1)">Delete</button>
```

**SESUDAH:**
```html
<button data-action="edit" data-course-id="1">Edit</button>
<button data-action="delete" data-course-id="1">Delete</button>
```

**File:** `src/frontend/app.ts` (displayAdminCourses function)

### **2. Menambahkan Event Delegation untuk Course Actions**

Ditambahkan event listener yang menangani klik pada tombol dengan data attributes:

```typescript
// Course actions - using event delegation
document.body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    const action = target.getAttribute('data-action');
    const courseId = target.getAttribute('data-course-id');
    
    if (action && courseId) {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'edit') {
            editCourse(parseInt(courseId));
        } else if (action === 'delete') {
            deleteCourse(parseInt(courseId));
        }
    }
});
```

**File:** `src/frontend/app.ts` (setupEventListeners function)

### **3. Menambahkan Event Listener untuk Add Course Button**

Ditambahkan handler untuk tombol "Add New Course":

```typescript
// Add Course button
document.body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.id === 'addCourseBtn' || target.closest('#addCourseBtn')) {
        e.preventDefault();
        openCourseModal();
    }
});
```

**File:** `src/frontend/app.ts` (setupEventListeners function)

### **4. Memastikan Course Form Event Listener**

Ditambahkan event listener untuk course form:

```typescript
const courseForm = document.getElementById('courseForm') as HTMLFormElement;
courseForm?.addEventListener('submit', handleCourseSubmit);
```

**File:** `src/frontend/app.ts` (setupEventListeners function)

### **5. Update CSP untuk Allow Inline Scripts (Opsional)**

Ditambahkan `'unsafe-eval'` ke CSP untuk kompatibilitas:

```typescript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
```

**File:** `src/backend/server-optimized.ts`

---

## 🚀 Langkah-Langkah

### **1. Build Project**

```bash
npm run build
```

### **2. RESTART SERVER**

**PENTING:** Server HARUS di-restart!

```bash
# Stop server (Ctrl + C)
npm start
```

### **3. Test Edit dan Delete**

1. Login sebagai Admin
2. Buka Admin Dashboard
3. Klik tombol **"Edit"** pada course
4. ✅ Modal edit harus muncul!
5. Klik tombol **"Delete"** pada course
6. ✅ Konfirmasi delete harus muncul!

---

## 🔍 Verifikasi

### **Test 1: Edit Course**

1. Login sebagai Admin
2. Klik "Edit" pada course
3. ✅ Modal edit muncul
4. ✅ Form terisi dengan data course
5. Edit data dan submit
6. ✅ Course ter-update

### **Test 2: Delete Course**

1. Login sebagai Admin
2. Klik "Delete" pada course
3. ✅ Konfirmasi dialog muncul
4. Klik "OK"
5. ✅ Course terhapus

### **Test 3: Add Course**

1. Login sebagai Admin
2. Klik "+ Add New Course"
3. ✅ Modal add course muncul
4. Isi form dan submit
5. ✅ Course baru terbuat

---

## 🐛 Troubleshooting

### **Tombol Masih Tidak Bisa Diklik**

**Penyebab:** Event listener belum terpasang atau ada konflik

**Solusi:**
1. Check browser console untuk error
2. Pastikan server sudah di-restart
3. Clear browser cache (Ctrl + Shift + Delete)
4. Refresh browser (Ctrl + F5)

### **Modal Tidak Muncul**

**Penyebab:** Element tidak ditemukan atau ada error JavaScript

**Solusi:**
1. Check browser console untuk error
2. Pastikan `courseModal` element ada di HTML
3. Pastikan `openModal()` function berfungsi

### **Form Submit Tidak Berfungsi**

**Penyebab:** Event listener belum terpasang

**Solusi:**
1. Pastikan `courseForm` element ada
2. Check apakah `handleCourseSubmit` function ada
3. Pastikan event listener terpasang di `setupEventListeners()`

---

## ✅ Checklist

- [x] Mengganti onclick dengan data attributes
- [x] Menambahkan event delegation untuk course actions
- [x] Menambahkan handler untuk Add Course button
- [x] Menambahkan event listener untuk course form
- [x] Update CSP (opsional)
- [x] Build berhasil
- [ ] Server di-restart
- [ ] Test Edit - berhasil
- [ ] Test Delete - berhasil
- [ ] Test Add Course - berhasil

---

## 🎯 Hasil Akhir

Setelah semua langkah:
- ✅ Tombol Edit bisa diklik
- ✅ Tombol Delete bisa diklik
- ✅ Modal edit muncul dengan benar
- ✅ Konfirmasi delete muncul
- ✅ Form submit berfungsi
- ✅ Tidak ada error di console

---

**Tombol Edit dan Delete sudah diperbaiki! 🎉**

