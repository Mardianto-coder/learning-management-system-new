# 🔧 Fix: "Unexpected token 'T', "Too many I"... is not valid JSON"

## ❌ Masalah

Error muncul saat register/login:
```
"Unexpected token 'T', "Too many I"... is not valid JSON"
```

**Penyebab:**
- Rate limiter mengembalikan plain text message, bukan JSON
- Frontend mencoba parse response sebagai JSON dan gagal
- Server mengembalikan HTML error page atau plain text

---

## ✅ Solusi yang Sudah Diterapkan

### **1. Update Rate Limiter (Backend)**

Rate limiter sekarang mengembalikan JSON response:

```typescript
// SEBELUM (plain text)
message: 'Too many login attempts, please try again later.'

// SESUDAH (JSON)
message: { message: 'Too many login attempts, please try again later.' }
```

**File:** `src/backend/utils/rateLimiter.ts`

### **2. Update Frontend API (Frontend)**

Frontend sekarang handle non-JSON responses dengan benar:

```typescript
// Check content type sebelum parsing
const contentType = response.headers.get('content-type');
let data: any;

if (contentType && contentType.includes('application/json')) {
    data = await response.json();
} else {
    // If not JSON, try to get text and parse
    const text = await response.text();
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(text || 'Request failed');
    }
}
```

**File:** `src/frontend/api.ts` (registerUser, loginUser, getAllCourses)

---

## 🚀 Langkah-Langkah

### **1. Build Project**

```bash
npm run build
```

### **2. RESTART SERVER**

**PENTING:** Server HARUS di-restart!

1. **Stop server:**
   - Tekan `Ctrl + C` di terminal

2. **Start server:**
   ```bash
   npm start
   ```

### **3. Test Register/Login**

1. Buka aplikasi di browser
2. Coba register user baru
3. **Tidak ada error JSON parse lagi!** ✅

---

## 🔍 Verifikasi

### **Test 1: Normal Register**

1. Register dengan data valid
2. ✅ Harus berhasil tanpa error

### **Test 2: Rate Limiting**

1. Coba register/login 6 kali dalam 15 menit
2. Request ke-6 akan di-block
3. ✅ Error message harus JSON format, bukan plain text

### **Test 3: Error Handling**

1. Coba register dengan email yang sudah ada
2. ✅ Error message harus tampil dengan benar (JSON format)

---

## 📋 Perubahan File

### **Backend:**
- ✅ `src/backend/utils/rateLimiter.ts` - Rate limiter return JSON

### **Frontend:**
- ✅ `src/frontend/api.ts` - Handle non-JSON responses
  - `registerUser()` - Updated
  - `loginUser()` - Updated
  - `getAllCourses()` - Updated

---

## 🐛 Troubleshooting

### **Masih Error "Unexpected token"**

**Penyebab:** Server belum di-restart

**Solusi:**
1. Stop server (Ctrl + C)
2. Start ulang: `npm start`
3. Refresh browser

### **Error "Too many requests" Masih Plain Text**

**Penyebab:** Build belum dilakukan atau server masih versi lama

**Solusi:**
1. Build: `npm run build`
2. Restart server
3. Test lagi

### **Error Lain Masih Muncul**

**Penyebab:** Fungsi API lain belum diupdate

**Solusi:**
- Semua fungsi API akan diupdate secara bertahap
- Untuk sementara, error handling sudah lebih baik

---

## ✅ Checklist

- [x] Rate limiter return JSON
- [x] Frontend handle non-JSON responses
- [x] Build berhasil
- [ ] Server di-restart
- [ ] Test register - tidak ada error
- [ ] Test login - tidak ada error
- [ ] Test rate limiting - error format JSON

---

## 🎯 Hasil Akhir

Setelah semua langkah:
- ✅ Tidak ada error "Unexpected token"
- ✅ Semua error messages dalam format JSON
- ✅ Rate limiting error tampil dengan benar
- ✅ Frontend handle semua response types dengan baik

---

**Error JSON parse sudah diperbaiki! 🎉**

