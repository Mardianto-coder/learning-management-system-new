# Troubleshooting Guide

## Masalah: Code tidak jalan

### 1. Pastikan build sudah berhasil
```bash
npm run build
```

### 2. Pastikan server berjalan
```bash
npm start
```
Server akan berjalan di `http://localhost:3000`

### 3. Cek Browser Console
Buka browser dan tekan F12, lihat di tab Console apakah ada error.

### 4. Masalah yang mungkin terjadi:

#### a. Import Error di Browser
Jika ada error seperti "Cannot find module" atau "Failed to resolve module":
- Pastikan file `dist/frontend/app.js` sudah ada
- Pastikan path di `index.html` benar: `dist/frontend/app.js`
- Pastikan menggunakan `type="module"` di script tag

#### b. CORS Error
Jika ada CORS error:
- Pastikan server berjalan di port 3000
- Pastikan API_BASE di frontend sesuai: `http://localhost:3000/api`

#### c. Server tidak berjalan
Jika server tidak berjalan:
- Cek apakah port 3000 sudah digunakan
- Cek error di terminal saat menjalankan `npm start`

### 5. Langkah Debugging:

1. **Cek apakah file JavaScript sudah di-compile:**
   ```bash
   ls dist/frontend/app.js
   ls dist/backend/server.js
   ```

2. **Test server secara manual:**
   ```bash
   node dist/backend/server.js
   ```

3. **Cek di browser:**
   - Buka `http://localhost:3000`
   - Tekan F12 untuk buka Developer Tools
   - Lihat tab Console untuk error
   - Lihat tab Network untuk cek apakah file JavaScript ter-load

4. **Clear cache browser:**
   - Tekan Ctrl+Shift+R untuk hard refresh
   - Atau clear browser cache

### 6. Rebuild dari awal:
```bash
# Hapus folder dist
rm -rf dist

# Rebuild
npm run build

# Start server
npm start
```

### 7. Cek Dependencies:
```bash
npm install
```

## Error yang sering terjadi:

### "Cannot find module '../types/index.js'"
- Pastikan sudah run `npm run build`
- Pastikan file `dist/frontend/types/index.js` ada

### "Failed to fetch" atau Network Error
- Pastikan server berjalan
- Cek apakah API endpoint benar
- Cek CORS settings di server

### "Unexpected token" atau Syntax Error
- Pastikan TypeScript sudah di-compile dengan benar
- Cek apakah ada error saat build

