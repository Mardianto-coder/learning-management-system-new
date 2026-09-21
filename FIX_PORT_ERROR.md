# Fix Port 3000 Already in Use Error

## Error yang terjadi:
```
Error: listen EADDRINUSE: address already in use :::3000
```

## Penyebab:
Port 3000 sudah digunakan oleh proses lain (biasanya server Node.js yang masih berjalan).

## Solusi:

### Cara 1: Stop proses yang menggunakan port 3000

**Windows PowerShell:**
```powershell
# Cari proses yang menggunakan port 3000
netstat -ano | findstr :3000

# Stop proses dengan PID yang ditemukan (ganti PID dengan angka yang muncul)
taskkill /F /PID <PID>
```

**Atau stop semua proses Node.js:**
```powershell
taskkill /F /IM node.exe
```

### Cara 2: Gunakan port lain

Edit file `src/backend/server.ts` dan ubah port:
```typescript
const PORT = process.env.PORT || 3001; // Ubah ke 3001 atau port lain
```

Lalu rebuild dan jalankan:
```bash
npm run build
npm start
```

### Cara 3: Set PORT environment variable

```powershell
$env:PORT=3001
npm start
```

## Langkah-langkah:

1. **Stop proses yang menggunakan port 3000:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Tunggu beberapa detik**

3. **Jalankan server lagi:**
   ```bash
   npm start
   ```

## Tips:

- Selalu stop server dengan `Ctrl+C` sebelum menutup terminal
- Jika lupa stop server, gunakan `taskkill /F /IM node.exe` untuk stop semua proses Node.js
- Bisa juga gunakan `npm run dev` yang akan auto-restart saat ada perubahan

