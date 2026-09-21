# 🔄 Cara Restart Server

## 📋 Langkah-langkah Restart Server

### **Langkah 1: Stop Server yang Sedang Berjalan**

#### **Cara 1: Di Terminal/PowerShell (Paling Mudah)**

Di terminal tempat server berjalan, tekan:
```
Ctrl + C
```

**Atau jika tidak berfungsi:**
```
Ctrl + Break
```

#### **Cara 2: Stop Semua Proses Node.js (Jika Cara 1 Tidak Berfungsi)**

Buka PowerShell baru dan jalankan:
```powershell
taskkill /F /IM node.exe
```

**Atau:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

---

### **Langkah 2: Rebuild Aplikasi (Opsional, Tapi Disarankan)**

```bash
npm run build
```

**Atau rebuild backend saja:**
```bash
npm run build:backend
```

---

### **Langkah 3: Start Server Lagi**

```bash
npm start
```

---

## 🎯 Quick Restart (3 Langkah)

```bash
# 1. Stop server (Ctrl+C di terminal server)

# 2. Rebuild (opsional)
npm run build

# 3. Start server
npm start
```

---

## 📝 Contoh Lengkap

### **Terminal 1 (Server yang Berjalan):**
```
PS E:\LMS Platfrom> npm start

> learning-management-system@1.0.0 start
> npm run build && node dist/backend/backend/server.js

Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
📊 Loaded: 0 users, 4 courses, 0 enrollments, 0 assignments

^C  ← Tekan Ctrl+C di sini untuk stop
```

### **Setelah Stop:**
```
PS E:\LMS Platfrom> npm start  ← Jalankan lagi
```

---

## ⚠️ Troubleshooting

### **Masalah: Ctrl+C Tidak Berfungsi**

**Solusi 1:** Tutup terminal dan buka terminal baru

**Solusi 2:** Stop semua proses Node.js:
```powershell
taskkill /F /IM node.exe
```

**Solusi 3:** Gunakan Task Manager:
1. Tekan `Ctrl + Shift + Esc`
2. Cari "Node.js" atau "node.exe"
3. Klik kanan → End Task

### **Masalah: Port 3000 Masih Terpakai**

**Error:** `Port 3000 is already in use`

**Solusi:**
```powershell
# Stop semua proses Node.js
taskkill /F /IM node.exe

# Atau cari process yang menggunakan port 3000
netstat -ano | findstr :3000
# Lalu stop process dengan PID yang muncul
```

### **Masalah: Server Tidak Start**

**Cek:**
1. Apakah ada error di terminal?
2. Apakah port 3000 sudah bebas?
3. Apakah build berhasil? (`npm run build`)

---

## 🔍 Verifikasi Server Berjalan

### **Cara 1: Cek Console Server**

Saat server start, harus melihat:
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
💾 Data storage: File-based (persistent)
📁 Data files: ./data/
```

### **Cara 2: Cek di Browser**

Buka: `http://localhost:3000`

Jika aplikasi terbuka → ✅ Server berjalan!

### **Cara 3: Cek Process**

Di PowerShell:
```powershell
Get-Process -Name node
```

Jika ada process → ✅ Server berjalan!

---

## 📋 Checklist Restart

- [ ] Stop server (Ctrl+C)
- [ ] Rebuild: `npm run build` (opsional)
- [ ] Start server: `npm start`
- [ ] Lihat pesan: "Server is running on http://localhost:3000"
- [ ] Lihat pesan: "💾 Data storage: File-based (persistent)"
- [ ] Test di browser: `http://localhost:3000`

---

## 🎯 Quick Reference

| Aksi | Command |
|------|---------|
| **Stop Server** | `Ctrl + C` (di terminal server) |
| **Stop Semua Node** | `taskkill /F /IM node.exe` |
| **Rebuild** | `npm run build` |
| **Start Server** | `npm start` |
| **Rebuild & Start** | `npm start` (otomatis rebuild) |

---

## 💡 Tips

1. **Selalu stop server sebelum rebuild** (kecuali menggunakan `npm start` yang otomatis rebuild)
2. **Gunakan `npm start`** - otomatis rebuild dan start
3. **Cek console** untuk memastikan server berjalan dengan benar
4. **Jika error**, cek apakah port 3000 sudah bebas

---

**Sekarang coba restart server! 🚀**

