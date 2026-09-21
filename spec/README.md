# Unit Tests dengan Jasmine

## Struktur Folder

```
spec/
├── support/
│   └── jasmine.json          # Konfigurasi Jasmine
├── helpers/
│   └── typescript.js         # Helper untuk TypeScript
├── frontend/
│   └── password-validator.spec.ts
└── backend/
    └── utils/
        └── password.spec.ts
```

## Menjalankan Tests

```bash
# Jalankan semua tests
npm test

# Jalankan tests dengan watch mode
npm run test:watch
```

## Menulis Test Baru

1. Buat file dengan nama `*.spec.ts` di folder `spec/`
2. Import fungsi yang ingin di-test
3. Gunakan `describe()` untuk grouping test
4. Gunakan `it()` untuk setiap test case
5. Gunakan `expect()` untuk assertions

### Contoh:

```typescript
import { myFunction } from '../../src/path/to/function';

describe('My Function', () => {
    it('should do something', () => {
        const result = myFunction();
        expect(result).toBe(expectedValue);
    });
});
```

## Jasmine Matchers

Jasmine menyediakan banyak matchers:
- `expect(value).toBe(expected)` - Strict equality (===)
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toBeDefined()`
- `expect(value).toBeNull()`
- `expect(value).toBeTruthy()`
- `expect(value).toBeFalsy()`
- `expect(value).toContain(item)`
- `expect(value).toMatch(regex)`
- Dan banyak lagi...

