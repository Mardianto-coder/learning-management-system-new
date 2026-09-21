# Project Structure - TypeScript & JavaScript Separation

## Overview

Proyek ini menggunakan **TypeScript** sebagai bahasa pemrograman utama, yang kemudian dikompilasi menjadi **JavaScript** untuk dijalankan.

## File Structure

### 📁 TypeScript Source Files (Edit di sini)
```
src/
├── frontend/
│   └── app.ts          ← Frontend TypeScript (akan jadi dist/frontend/app.js)
├── backend/
│   └── server.ts       ← Backend TypeScript (akan jadi dist/backend/server.js)
└── types/
    └── index.ts        ← Type definitions yang di-share
```

### 📁 Compiled JavaScript Files (Auto-generated, jangan edit)
```
dist/
├── frontend/
│   ├── app.js          ← Compiled dari src/frontend/app.ts
│   └── types/
│       └── index.js    ← Compiled dari src/types/index.ts
└── backend/
    ├── server.js       ← Compiled dari src/backend/server.ts
    └── types/
        └── index.js    ← Compiled dari src/types/index.ts
```

### 📁 Other Files
```
├── index.html          ← Menggunakan dist/frontend/app.js
├── styles.css          ← CSS styling
├── package.json        ← Dependencies & build scripts
├── tsconfig.json       ← Main TypeScript config
├── tsconfig.frontend.json  ← Frontend TypeScript config
├── tsconfig.backend.json   ← Backend TypeScript config
└── backup/             ← File JavaScript lama (backup)
    ├── app.js.backup
    └── server.js.backup
```

## Workflow

### 1. Development (Edit TypeScript)
- Edit file di `src/frontend/app.ts` atau `src/backend/server.ts`
- File TypeScript ini adalah source code utama

### 2. Build (Compile TypeScript → JavaScript)
```bash
npm run build
```
- TypeScript dikompilasi menjadi JavaScript
- Hasil kompilasi ada di folder `dist/`

### 3. Run (Jalankan JavaScript yang sudah dikompilasi)
```bash
npm start
```
- Menjalankan `dist/backend/server.js`
- Browser memuat `dist/frontend/app.js`

## Perbedaan TypeScript vs JavaScript

### TypeScript (src/)
- ✅ Type safety
- ✅ IntelliSense yang lebih baik
- ✅ Error detection sebelum runtime
- ✅ Lebih mudah maintain untuk project besar

### JavaScript (dist/)
- ✅ Bisa langsung dijalankan
- ✅ Compatible dengan browser dan Node.js
- ⚠️ Auto-generated, jangan edit manual

## Build Commands

```bash
# Build semua (frontend + backend)
npm run build

# Build frontend saja
npm run build:frontend

# Build backend saja
npm run build:backend

# Development mode (auto-rebuild)
npm run dev
```

## Important Notes

1. **JANGAN edit file di `dist/`** - File ini auto-generated dari TypeScript
2. **SELALU edit file di `src/`** - Ini adalah source code utama
3. **Jalankan `npm run build`** setelah mengubah TypeScript
4. Folder `dist/` akan otomatis dibuat saat build pertama kali

## Type Definitions

Semua type definitions ada di `src/types/index.ts`:
- `User`, `Course`, `Assignment`
- `UserRole`, `AssignmentStatus`
- `CourseData`, `AssignmentData`
- dll.

Types ini di-share antara frontend dan backend untuk konsistensi.

