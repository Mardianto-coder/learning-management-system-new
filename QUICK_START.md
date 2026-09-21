# Quick Start Guide

## Cara Menjalankan Aplikasi

### 1. Install Dependencies (jika belum)
```bash
npm install
```

### 2. Build TypeScript ke JavaScript
```bash
npm run build
```

### 3. Jalankan Server
```bash
npm start
```

Server akan berjalan di: **http://localhost:3000**

### 4. Buka di Browser
Buka browser dan akses: **http://localhost:3000**

## Troubleshooting

### Jika ada error "Cannot find module":
1. Pastikan sudah run `npm install`
2. Pastikan sudah run `npm run build`
3. Cek apakah folder `dist/` sudah ada

### Jika server tidak jalan:
1. Cek apakah port 3000 sudah digunakan
2. Cek error di terminal
3. Coba stop semua proses node: `taskkill /F /IM node.exe`

### Jika frontend tidak load:
1. Buka Developer Tools (F12)
2. Cek tab Console untuk error
3. Cek tab Network untuk melihat apakah file JavaScript ter-load
4. Pastikan path di `index.html` benar: `dist/frontend/app.js`

## Development Mode

Untuk development dengan auto-reload:
```bash
npm run dev
```

## Struktur File

- **TypeScript Source**: `src/` (edit di sini)
- **Compiled JavaScript**: `dist/` (auto-generated, jangan edit)
- **Frontend**: `src/frontend/app.ts` → `dist/frontend/app.js`
- **Backend**: `src/backend/server.ts` → `dist/backend/server.js`

## Important Notes

- **JANGAN edit file di `dist/`** - File ini auto-generated
- **SELALU edit file di `src/`** - Ini adalah source code
- **Jalankan `npm run build`** setelah mengubah TypeScript
- **Server harus berjalan** sebelum membuka aplikasi di browser

