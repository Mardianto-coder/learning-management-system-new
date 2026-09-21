# 🔧 Troubleshooting Testing dengan Jasmine

Panduan untuk mengatasi masalah yang mungkin muncul saat menjalankan unit tests.

## ❌ Error: "Unknown options: --watch"

### **Gejala:**
```
Unknown options: --watch
```

### **Penyebab:**
Jasmine tidak memiliki built-in `--watch` option.

### **Solusi:**
✅ **Sudah diperbaiki!** Script `test:watch` sekarang menggunakan `nodemon`:
```bash
npm run test:watch
```

Jika masih muncul error, pastikan `package.json` sudah ter-update dengan script yang benar.

---

## ❌ Error: "Cannot find module 'ts-node/register'"

### **Gejala:**
```
Error: Cannot find module 'ts-node/register'
```

### **Penyebab:**
Package `ts-node` belum terinstall.

### **Solusi:**
```bash
npm install --save-dev ts-node
```

---

## ❌ Error: "Cannot find module 'jasmine'"

### **Gejala:**
```
Error: Cannot find module 'jasmine'
```

### **Penyebab:**
Package `jasmine` belum terinstall.

### **Solusi:**
```bash
npm install --save-dev jasmine @types/jasmine
```

---

## ❌ Error: "Cannot find module" (dari source code)

### **Gejala:**
```
Error: Cannot find module '../../src/path/to/module'
```

### **Penyebab:**
- Path import salah
- File belum ada
- TypeScript belum dikompilasi

### **Solusi:**

1. **Cek path import di test file:**
   ```typescript
   // Pastikan path benar
   import { function } from '../../src/frontend/file';
   ```

2. **Pastikan file source ada:**
   ```bash
   # Cek apakah file ada
   dir src\frontend\file.ts
   ```

3. **Rebuild TypeScript (jika perlu):**
   ```bash
   npm run build
   ```

---

## ❌ Error: "TypeError: Cannot read property 'X' of undefined"

### **Gejala:**
```
TypeError: Cannot read property 'X' of undefined
```

### **Penyebab:**
- Function mengembalikan `undefined`
- Mock tidak disetup dengan benar
- Async function tidak di-handle dengan benar

### **Solusi:**

1. **Untuk async functions, gunakan `async/await`:**
   ```typescript
   it('should work', async () => {
       const result = await asyncFunction();
       expect(result).toBeDefined();
   });
   ```

2. **Cek apakah function mengembalikan nilai:**
   ```typescript
   it('should return value', () => {
       const result = myFunction();
       expect(result).toBeDefined(); // Pastikan tidak undefined
   });
   ```

---

## ❌ Error: "SyntaxError: Unexpected token"

### **Gejala:**
```
SyntaxError: Unexpected token
```

### **Penyebab:**
- TypeScript syntax tidak dikenali
- `ts-node` tidak ter-load dengan benar

### **Solusi:**

1. **Pastikan `jasmine.json` memiliki `requires`:**
   ```json
   {
     "requires": ["ts-node/register"]
   }
   ```

2. **Pastikan script menggunakan `--require=ts-node/register`:**
   ```json
   "test": "jasmine --config=jasmine.json --require=ts-node/register"
   ```

---

## ❌ Test tidak berjalan / Tidak ada output

### **Gejala:**
Tidak ada output saat menjalankan `npm test`

### **Penyebab:**
- Tidak ada test files yang ditemukan
- Konfigurasi `jasmine.json` salah
- Test files tidak sesuai pattern

### **Solusi:**

1. **Cek apakah ada test files:**
   ```bash
   dir spec\**\*.spec.ts /s
   ```

2. **Pastikan pattern di `jasmine.json` benar:**
   ```json
   {
     "spec_files": ["**/*[sS]pec.ts"]
   }
   ```

3. **Pastikan nama file test berakhiran `.spec.ts`:**
   ```
   ✅ password-validator.spec.ts
   ❌ password-validator.test.ts
   ❌ password-validator.ts
   ```

---

## ❌ Error: "Port already in use" (saat test:watch)

### **Gejala:**
```
Error: Port 3000 is already in use
```

### **Penyebab:**
Server masih berjalan di port 3000.

### **Solusi:**

1. **Stop server yang berjalan:**
   ```powershell
   # Di terminal server, tekan Ctrl+C
   # Atau stop semua node processes:
   taskkill /F /IM node.exe
   ```

2. **Atau gunakan port berbeda untuk testing**

---

## ❌ Test selalu fail / Semua test fail

### **Gejala:**
```
X specs, X failures
```

### **Penyebab:**
- Logic test salah
- Expected value salah
- Function behavior berubah

### **Solusi:**

1. **Cek expected value:**
   ```typescript
   // Pastikan expected value benar
   expect(result).toBe(expectedValue);
   ```

2. **Debug dengan console.log:**
   ```typescript
   it('should work', () => {
       const result = myFunction();
       console.log('Result:', result); // Debug
       expect(result).toBe(expected);
   });
   ```

3. **Test manual function:**
   ```typescript
   // Test di browser console atau Node.js REPL
   import { myFunction } from './path';
   myFunction('test');
   ```

---

## ❌ Error: "Cannot find module '@types/jasmine'"

### **Gejala:**
```
Cannot find module '@types/jasmine'
```

### **Penyebab:**
Type definitions belum terinstall.

### **Solusi:**
```bash
npm install --save-dev @types/jasmine
```

---

## ✅ Checklist Troubleshooting

Jika test tidak berjalan, cek:

- [ ] Apakah semua dependencies terinstall? (`npm install`)
- [ ] Apakah `jasmine.json` ada dan konfigurasinya benar?
- [ ] Apakah test files ada di folder `spec/`?
- [ ] Apakah nama test files berakhiran `.spec.ts`?
- [ ] Apakah path import di test file benar?
- [ ] Apakah source files yang di-test ada?
- [ ] Apakah `ts-node` terinstall?
- [ ] Apakah script di `package.json` benar?

---

## 🆘 Masih Error?

Jika masih ada masalah:

1. **Cek error message dengan detail:**
   ```bash
   npm test -- --verbose
   ```

2. **Cek konfigurasi:**
   ```bash
   # Pastikan jasmine.json valid
   type jasmine.json
   ```

3. **Test dengan file sederhana:**
   ```typescript
   // spec/test.spec.ts
   describe('Simple Test', () => {
       it('should pass', () => {
           expect(true).toBe(true);
       });
   });
   ```

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📞 Quick Fix Commands

```bash
# Reinstall semua dependencies
npm install

# Rebuild TypeScript
npm run build

# Jalankan test dengan verbose
npm test -- --verbose

# Cek apakah jasmine terinstall
npm list jasmine

# Cek apakah ts-node terinstall
npm list ts-node
```

