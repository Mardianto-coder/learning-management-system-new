# ⚡ Quick Fix - Testing Errors

## 🚨 Error yang Paling Sering Muncul

### 1. **"Unknown options: --watch"**

**Solusi cepat:**
```bash
# Gunakan script yang sudah diperbaiki
npm run test:watch
```

**Jika masih error:**
- Pastikan `package.json` sudah ter-update
- Cek script `test:watch` menggunakan `nodemon`

---

### 2. **"Cannot find module 'ts-node/register'"**

**Solusi cepat:**
```bash
npm install --save-dev ts-node
```

---

### 3. **"Cannot find module 'jasmine'"**

**Solusi cepat:**
```bash
npm install --save-dev jasmine @types/jasmine
```

---

### 4. **Test tidak berjalan / Tidak ada output**

**Solusi cepat:**
```bash
# 1. Cek apakah ada test files
dir spec\**\*.spec.ts /s

# 2. Pastikan nama file berakhiran .spec.ts
# ✅ password-validator.spec.ts
# ❌ password-validator.test.ts

# 3. Jalankan dengan verbose untuk debug
npm test -- --verbose
```

---

### 5. **"Cannot find module" dari source code**

**Solusi cepat:**
```typescript
// Pastikan path import benar
// Dari spec/frontend/file.spec.ts:
import { function } from '../../src/frontend/file';  // ✅
import { function } from '../src/frontend/file';     // ❌
```

---

## 🔧 Fix All-in-One

Jika banyak error, jalankan ini:

```bash
# 1. Reinstall semua dependencies
npm install

# 2. Pastikan semua packages terinstall
npm install --save-dev jasmine @types/jasmine ts-node

# 3. Rebuild TypeScript
npm run build

# 4. Jalankan test
npm test
```

---

## ✅ Checklist Cepat

- [ ] `npm install` sudah dijalankan?
- [ ] File test ada di folder `spec/`?
- [ ] Nama file berakhiran `.spec.ts`?
- [ ] `jasmine.json` ada di root?
- [ ] Script di `package.json` benar?

---

## 📚 Dokumentasi Lengkap

Untuk troubleshooting lebih detail, lihat:
- `TROUBLESHOOTING_TESTING.md` - Panduan lengkap
- `TESTING.md` - Cara menggunakan Jasmine

