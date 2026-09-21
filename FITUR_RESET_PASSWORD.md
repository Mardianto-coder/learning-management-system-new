# 🔐 Fitur Reset Password dan Update Password

## 📋 Fitur yang Ditambahkan

### **1. Register dengan Email yang Sama (Update Password)**

Sekarang jika email sudah terdaftar, register akan **update password** untuk email tersebut:

- ✅ Email sudah ada → Update password, name, dan role
- ✅ Email belum ada → Buat user baru
- ✅ Tidak perlu error "Email already registered"

**Cara menggunakan:**
1. Buka form Register
2. Isi email yang sudah terdaftar
3. Isi password baru
4. Submit
5. Password akan di-update dan bisa langsung login

### **2. Reset Password (Forgot Password)**

Ditambahkan form "Forgot Password" di modal login:

- ✅ Link "Forgot Password?" di bawah tombol Login
- ✅ Form untuk reset password dengan email
- ✅ Setelah reset, bisa langsung ke form Register dengan email terisi

**Cara menggunakan:**
1. Klik "Login" di navbar
2. Klik "Forgot Password?" di bawah tombol Login
3. Masukkan email
4. Submit
5. Akan redirect ke form Register dengan email sudah terisi
6. Isi password baru dan submit

### **3. Change Password (Untuk User yang Sudah Login)**

Endpoint sudah tersedia untuk change password:
- `PUT /api/auth/change-password` - Change password dengan current password

**Note:** UI untuk fitur ini akan ditambahkan di dashboard nanti.

### **4. Update Email (Untuk User yang Sudah Login)**

Endpoint sudah tersedia untuk update email:
- `PUT /api/auth/update-email` - Update email user

**Note:** UI untuk fitur ini akan ditambahkan di dashboard nanti.

---

## 🚀 Cara Menggunakan

### **Reset Password dengan Email yang Sama:**

**Metode 1: Langsung Register**
1. Buka form Register
2. Isi email yang sudah terdaftar
3. Isi password baru
4. Submit
5. ✅ Password akan di-update!

**Metode 2: Forgot Password**
1. Klik "Login" → "Forgot Password?"
2. Masukkan email
3. Submit
4. Akan redirect ke Register dengan email terisi
5. Isi password baru dan submit
6. ✅ Password akan di-update!

---

## 📋 API Endpoints Baru

### **1. Reset Password**
```
POST /api/auth/reset-password
Body: { email: "user@example.com" }
Response: { message: "Password reset initiated..." }
```

### **2. Change Password (Authenticated)**
```
PUT /api/auth/change-password
Headers: { Authorization: "Bearer <token>" }
Body: { 
    currentPassword: "oldpass",
    password: "newpass123"
}
Response: { message: "Password changed successfully" }
```

### **3. Update Email (Authenticated)**
```
PUT /api/auth/update-email
Headers: { Authorization: "Bearer <token>" }
Body: { email: "newemail@example.com" }
Response: { 
    message: "Email updated successfully",
    user: {...},
    token: "new_jwt_token"
}
```

---

## 🔍 Verifikasi

### **Test 1: Register dengan Email yang Sama**

1. Register dengan email: "test@example.com", password: "Test123"
2. Logout
3. Register lagi dengan email yang sama: "test@example.com", password: "NewPass123"
4. ✅ Password akan di-update!
5. Login dengan password baru: "NewPass123"
6. ✅ Login berhasil!

### **Test 2: Forgot Password**

1. Klik "Login" → "Forgot Password?"
2. Masukkan email: "test@example.com"
3. Submit
4. ✅ Redirect ke Register dengan email terisi
5. Isi password baru: "NewPass456"
6. Submit
7. ✅ Password di-update!

---

## ✅ Checklist

- [x] Register dengan email yang sama → Update password
- [x] Form Forgot Password ditambahkan
- [x] Reset password endpoint
- [x] Change password endpoint (backend)
- [x] Update email endpoint (backend)
- [x] Build berhasil
- [ ] Server di-restart
- [ ] Test reset password - berhasil
- [ ] Test register dengan email yang sama - berhasil

---

## 🎯 Hasil Akhir

Setelah semua langkah:
- ✅ Bisa pakai email yang sama untuk update password
- ✅ Fitur Forgot Password tersedia
- ✅ User experience lebih baik
- ✅ Tidak perlu error "Email already registered"

---

**Fitur reset password dan update password sudah ditambahkan! 🎉**

