# 🔄 Cara Test Berjalan Otomatis

## 📋 Opsi yang Tersedia

### **Opsi 1: Watch Mode di Terminal Terpisah (Saat Ini) ⭐ RECOMMENDED**

**Cara kerja:**
- Jalankan `npm run test:watch` di terminal terpisah
- Biarkan terminal itu terbuka
- Test akan otomatis berjalan setiap kali ada perubahan file
- **TIDAK perlu dijalankan lagi** selama terminal tidak ditutup

**Kelebihan:**
- ✅ Test berjalan otomatis saat coding
- ✅ Tidak mengganggu server development
- ✅ Bisa lihat hasil test real-time
- ✅ Watch mode tetap aktif sampai terminal ditutup

**Kekurangan:**
- ⚠️ Perlu buka terminal terpisah
- ⚠️ Harus dijalankan manual sekali di awal

**Cara pakai:**
```bash
# Terminal 1: Jalankan server
npm run dev

# Terminal 2: Jalankan test watch (JALANKAN SEKALI, lalu biarkan)
npm run test:watch
```

**Status:**
- ✅ Watch mode akan **tetap aktif** selama terminal tidak ditutup
- ✅ Test akan **otomatis berjalan** setiap kali Anda edit file
- ✅ **TIDAK perlu** menjalankan `npm run test:watch` lagi

---

### **Opsi 2: Test Sebelum Start/Dev (Pre-run)** ⚠️

Test akan berjalan **sebelum** server start. Jika test gagal, server tidak akan start.

**Cara pakai:**
```bash
# Test akan otomatis berjalan sebelum start
npm start

# Test akan otomatis berjalan sebelum dev
npm run dev
```

**Kelebihan:**
- ✅ Memastikan code ter-test sebelum server start
- ✅ Mencegah deploy code yang broken

**Kekurangan:**
- ⚠️ Harus menunggu test selesai setiap kali start
- ⚠️ Jika test gagal, server tidak akan start

**Catatan:** Script `prestart` dan `predev` sudah ditambahkan di `package.json`.

---

### **Opsi 3: Test + Dev Bersamaan (Parallel)**

Test dan server berjalan bersamaan di background.

**Cara pakai:**
```bash
# Jalankan test watch dan dev bersamaan
npm run dev:with-test
```

**Kelebihan:**
- ✅ Test dan server berjalan bersamaan
- ✅ Hanya perlu 1 command

**Kekurangan:**
- ⚠️ Output bisa tercampur
- ⚠️ Lebih sulit untuk debug

**Catatan:** Script `dev:with-test` sudah ditambahkan, tapi untuk Windows PowerShell mungkin perlu adjustment.

---

### **Opsi 4: Pre-commit Hooks (Git)**

Test otomatis berjalan sebelum commit code ke Git.

**Cara setup:**
Perlu install `husky` atau setup manual git hooks.

---

## 🎯 Rekomendasi

### **Untuk Development (Paling Praktis):**

**Gunakan Opsi 1 - Watch Mode di Terminal Terpisah**

1. **Buka 2 terminal:**
   ```
   Terminal 1: npm run dev        (Server)
   Terminal 2: npm run test:watch (Test - jalankan sekali, lalu biarkan)
   ```

2. **Atau gunakan VS Code terminal split:**
   - Buka 2 terminal panel di VS Code
   - Satu untuk server, satu untuk test

3. **Watch mode akan tetap aktif:**
   - ✅ Selama terminal tidak ditutup
   - ✅ Selama tidak ada error fatal
   - ✅ Akan auto-restart saat ada perubahan file
   - ✅ **TIDAK perlu** menjalankan lagi

---

## ❓ FAQ

### **Q: Apakah harus menjalankan `npm run test:watch` lagi setiap kali?**

**A: TIDAK!** 
- Jika terminal masih terbuka dan watch mode masih aktif, **TIDAK perlu** menjalankan lagi
- Watch mode akan **tetap aktif** sampai:
  - Terminal ditutup
  - Anda tekan `Ctrl+C`
  - Ada error fatal

### **Q: Bagaimana tahu watch mode masih aktif?**

**A: Cek terminal:**
- Jika ada teks: `[nodemon] clean exit - waiting for changes before restart`
- Berarti watch mode **masih aktif** ✅

### **Q: Test tidak jalan otomatis lagi?**

**A: Cek:**
1. Apakah terminal masih terbuka?
2. Apakah ada error di terminal?
3. Jika perlu, restart: Tekan `rs` + Enter di terminal watch mode
4. Atau stop dan jalankan lagi: `Ctrl+C` lalu `npm run test:watch`

### **Q: Bisa test jalan otomatis tanpa buka terminal terpisah?**

**A: Bisa, tapi kurang praktis:**
- Opsi 2: Test sebelum start (tapi harus menunggu setiap kali)
- Opsi 3: Test + dev bersamaan (tapi output tercampur)

**Rekomendasi:** Tetap gunakan Opsi 1 (terminal terpisah) untuk development.

---

## 💡 Tips

1. **Buka 2 terminal di awal development:**
   - Terminal 1: `npm run dev`
   - Terminal 2: `npm run test:watch`
   - Biarkan keduanya terbuka

2. **VS Code Terminal Split:**
   ```
   View → Terminal → Split Terminal
   ```

3. **Restart watch mode jika perlu:**
   - Di terminal watch mode, ketik: `rs` + Enter
   - Atau: `Ctrl+C` lalu `npm run test:watch`

4. **Stop watch mode:**
   - Tekan `Ctrl+C` di terminal watch mode

---

## 📊 Perbandingan Opsi

| Opsi | Auto-run | Praktis | Rekomendasi |
|------|----------|---------|-------------|
| **1. Watch Mode (Terminal Terpisah)** | ✅ Ya | ✅✅✅ Sangat | ⭐⭐⭐⭐⭐ |
| **2. Pre-start/Pre-dev** | ✅ Ya | ⚠️ Kurang | ⭐⭐⭐ |
| **3. Parallel (Test + Dev)** | ✅ Ya | ⚠️ Kurang | ⭐⭐ |
| **4. Pre-commit Hooks** | ✅ Ya | ✅✅ | ⭐⭐⭐⭐ |

---

## 🎉 Kesimpulan

**Untuk development sehari-hari:**
- ✅ Gunakan **Opsi 1** (Watch mode di terminal terpisah)
- ✅ Jalankan `npm run test:watch` **sekali** di awal
- ✅ Biarkan terminal terbuka
- ✅ Test akan **otomatis berjalan** setiap kali ada perubahan
- ✅ **TIDAK perlu** menjalankan lagi selama terminal tidak ditutup

**Untuk production/CI:**
- ✅ Gunakan **Opsi 2** (Test sebelum start)
- ✅ Memastikan code ter-test sebelum deploy
