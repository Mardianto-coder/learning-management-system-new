# 🔧 Setup Environment Variables

## 📋 Setup yang Diperlukan

Aplikasi ini **WAJIB** menggunakan environment variables untuk keamanan, terutama untuk JWT_SECRET.

---

## 🚀 Quick Start

### **1. Copy File .env.example**

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### **2. Edit File .env**

Buka file `.env` dan isi dengan nilai yang sesuai:

```env
# JWT Secret - WAJIB untuk keamanan
JWT_SECRET=your-strong-secret-key-here-change-this-in-production

# JWT Expiration (opsional, default: 24h)
JWT_EXPIRES_IN=24h

# Server Port (opsional, default: 3000)
PORT=3000

# Frontend URL untuk CORS (opsional, default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### **3. Generate JWT Secret yang Kuat**

#### **Cara 1: Menggunakan OpenSSL**
```bash
openssl rand -base64 32
```

#### **Cara 2: Menggunakan Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### **Cara 3: Online Generator**
- Gunakan password generator online yang aman
- Minimal 32 karakter, kombinasi huruf, angka, dan simbol

**Contoh JWT_SECRET yang kuat:**
```
JWT_SECRET=K8xL2mN9pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8z
```

---

## ⚠️ PENTING: JWT_SECRET

### **Mengapa Wajib?**

1. **Keamanan:** JWT_SECRET digunakan untuk sign dan verify token
2. **Production:** Jika tidak set, aplikasi akan error di production
3. **Development:** Jika tidak set, akan ada warning di console

### **Apa yang Terjadi jika Tidak Set?**

#### **Development:**
- ⚠️ Warning di console
- ⚠️ Aplikasi tetap jalan (tapi kurang aman)

#### **Production:**
- ❌ **Aplikasi TIDAK akan start**
- ❌ Error: "JWT_SECRET environment variable is required in production"

---

## 📝 Environment Variables

### **Wajib (Required):**

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `JWT_SECRET` | Secret key untuk JWT token | `K8xL2mN9pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8z` |

### **Opsional (Optional):**

| Variable | Deskripsi | Default | Contoh |
|----------|-----------|---------|--------|
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` | `24h`, `7d`, `30d` |
| `PORT` | Server port | `3000` | `3000`, `8080` |
| `FRONTEND_URL` | Frontend URL untuk CORS | `http://localhost:3000` | `http://localhost:3000` |
| `NODE_ENV` | Node environment | `development` | `development`, `production` |

---

## 🔒 Keamanan

### **Jangan:**

- ❌ Commit file `.env` ke Git (sudah ada di `.gitignore`)
- ❌ Share JWT_SECRET dengan orang lain
- ❌ Gunakan JWT_SECRET yang sama untuk development dan production
- ❌ Gunakan JWT_SECRET yang lemah (seperti "secret", "password", dll)

### **Lakukan:**

- ✅ Generate JWT_SECRET yang kuat dan unik
- ✅ Gunakan JWT_SECRET berbeda untuk development dan production
- ✅ Simpan JWT_SECRET dengan aman
- ✅ Rotate JWT_SECRET secara berkala (setiap 3-6 bulan)

---

## 🧪 Testing

### **Cek Apakah Environment Variables Ter-load:**

```bash
# Jalankan server
npm start

# Cek console output
# Jika JWT_SECRET tidak set, akan ada warning:
# ❌ CRITICAL: JWT_SECRET environment variable is not set!
```

### **Test dengan Environment Variable:**

```bash
# Windows PowerShell
$env:JWT_SECRET="test-secret"; npm start

# Linux/Mac
JWT_SECRET=test-secret npm start
```

---

## 📚 Production Setup

### **1. Setup Environment Variables di Server**

#### **Menggunakan .env file:**
```bash
# Di server production
nano .env
# Isi dengan JWT_SECRET yang kuat
```

#### **Menggunakan System Environment Variables:**
```bash
# Linux/Mac
export JWT_SECRET="your-production-secret"
export NODE_ENV="production"

# Windows
set JWT_SECRET=your-production-secret
set NODE_ENV=production
```

#### **Menggunakan PM2:**
```bash
# PM2 ecosystem file
pm2 start ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'lms-platform',
    script: './dist/backend/backend/server-optimized.js',
    env: {
      NODE_ENV: 'production',
      JWT_SECRET: 'your-production-secret',
      PORT: 3000
    }
  }]
};
```

### **2. Verifikasi Setup**

```bash
# Cek apakah environment variables ter-load
node -e "console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')"
```

---

## 🆘 Troubleshooting

### **Error: "JWT_SECRET environment variable is not set"**

**Solusi:**
1. Pastikan file `.env` ada di root project
2. Pastikan isi `.env` dengan `JWT_SECRET=your-secret`
3. Restart server setelah edit `.env`

### **Error: "JWT_SECRET environment variable is required in production"**

**Solusi:**
1. Set `JWT_SECRET` di environment variables server
2. Atau set di `.env` file
3. Pastikan `NODE_ENV=production` tidak set jika belum siap

### **Environment Variables Tidak Ter-load**

**Solusi:**
1. Install `dotenv` package (jika belum):
   ```bash
   npm install dotenv
   ```
2. Atau gunakan `--require` flag:
   ```bash
   node --require dotenv/config dist/backend/backend/server-optimized.js
   ```

---

## 📖 Referensi

- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [dotenv Package](https://www.npmjs.com/package/dotenv)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

