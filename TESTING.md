# 🧪 Unit Testing dengan Jasmine

Proyek ini menggunakan **Jasmine** sebagai framework untuk unit testing.

## 📦 Dependencies

- `jasmine` - Testing framework
- `@types/jasmine` - Type definitions untuk TypeScript
- `ts-node` - Menjalankan TypeScript langsung tanpa compile

## 🚀 Menjalankan Tests

```bash
# Jalankan semua tests
npm test

# Jalankan tests dengan watch mode (auto-reload saat file berubah)
# Menggunakan nodemon untuk watch file changes
npm run test:watch
```

**Catatan:** Watch mode menggunakan `nodemon` karena Jasmine tidak memiliki built-in `--watch` option. Nodemon akan otomatis menjalankan test ulang ketika ada perubahan di folder `spec/` atau `src/`.

## 📁 Struktur Folder

```
spec/
├── support/
│   └── jasmine.json          # Konfigurasi Jasmine (alternatif)
├── helpers/
│   └── typescript.js         # Helper untuk TypeScript
├── frontend/
│   └── password-validator.spec.ts
└── backend/
    └── utils/
        └── password.spec.ts
```

## ✍️ Menulis Test Baru

1. Buat file dengan nama `*.spec.ts` di folder `spec/`
2. Import fungsi yang ingin di-test
3. Gunakan `describe()` untuk grouping test
4. Gunakan `it()` untuk setiap test case
5. Gunakan `expect()` untuk assertions

### Contoh Test:

```typescript
import { myFunction } from '../../src/path/to/function';

describe('My Function', () => {
    it('should return expected value', () => {
        const result = myFunction('input');
        expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
        const result = myFunction('');
        expect(result).toBeDefined();
    });
});
```

## 🎯 Jasmine Matchers

Jasmine menyediakan banyak matchers untuk assertions:

- `expect(value).toBe(expected)` - Strict equality (===)
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toBeDefined()` - Check if defined
- `expect(value).toBeNull()` - Check if null
- `expect(value).toBeTruthy()` - Check if truthy
- `expect(value).toBeFalsy()` - Check if falsy
- `expect(value).toContain(item)` - Check if array/string contains
- `expect(value).toMatch(regex)` - Check if matches regex
- `expect(value).toBeGreaterThan(number)` - Number comparison
- `expect(value).toBeLessThan(number)` - Number comparison
- Dan banyak lagi...

## 📝 Test Files yang Sudah Ada

1. **`spec/frontend/password-validator.spec.ts`**
   - Test untuk validasi format password
   - Test berbagai skenario (valid, invalid, edge cases)

2. **`spec/backend/utils/password.spec.ts`**
   - Test untuk password hashing dengan bcrypt
   - Test untuk password verification

## 🔧 Konfigurasi

Konfigurasi Jasmine ada di `jasmine.json`:

```json
{
  "spec_dir": "spec",
  "spec_files": ["**/*[sS]pec.ts"],
  "helpers": ["helpers/**/*.js"],
  "requires": ["ts-node/register"],
  "stopSpecOnExpectationFailure": false,
  "random": false
}
```

## 💡 Tips

1. **Test Naming**: Gunakan nama yang deskriptif
   - ✅ `it('should return valid for password with all requirements')`
   - ❌ `it('test1')`

2. **Test Organization**: Group related tests dengan `describe()`
   ```typescript
   describe('Password Validator', () => {
       describe('validatePasswordFormat', () => {
           it('should...', () => {});
       });
   });
   ```

3. **Async Tests**: Untuk async functions, gunakan `async/await` atau `done()`
   ```typescript
   it('should hash password', async () => {
       const hash = await hashPassword('test');
       expect(hash).toBeDefined();
   });
   ```

4. **Test Coverage**: Target minimal 80% code coverage untuk fungsi-fungsi penting

## 📚 Resources

- [Jasmine Documentation](https://jasmine.github.io/)
- [Jasmine Matchers](https://jasmine.github.io/api/edge/matchers.html)
- [TypeScript Testing Best Practices](https://www.typescriptlang.org/docs/handbook/testing.html)

