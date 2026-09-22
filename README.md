# LMS Platform

Aplikasi Learning Management System untuk siswa dan admin/dosen.

Aplikasi yang **sekarang dipakai** ada di folder `web/`. Teknologi utamanya:

- **TypeScript**
- **React**
- **Next.js** (App Router)
- **Redux Toolkit**
- **HTML + CSS**
- **Supabase** (opsional — database, login, dan file; jika belum diisi, data memakai file JSON)
- **Vercel** (hosting online; bukan folder di repo — dikonfigurasi di dashboard Vercel)

Bisa dibuka dari **laptop** dan **HP** di Wi‑Fi yang sama, atau lewat URL Vercel di internet.

Lokasi proyek di komputer:

`E:\LMS platfrom paling baru\LMS-Platfrom-main`

---

## Isi folder penting

```
LMS-Platfrom-main/
├── web/                      ← APLIKASI UTAMA (Next.js + React + Redux)
│   ├── app/                  Halaman & API
│   │   ├── page.tsx          Home
│   │   ├── courses/          Daftar kelas
│   │   ├── login/            Login / register
│   │   ├── cart/             Keranjang & pembayaran
│   │   ├── dashboard/        Dashboard siswa
│   │   ├── admin/            Panel dosen/admin
│   │   └── api/              API (auth, courses, orders, files, ...)
│   ├── components/           Navbar, modal, keranjang, bukti bayar
│   ├── store/                Redux (auth, courses, cart)
│   ├── lib/                  Storage, upload, Supabase, validasi
│   ├── .env.example          Contoh kunci (JWT + Supabase)
│   ├── vercel.json           Memberitahu Vercel ini proyek Next.js
│   └── package.json
├── data/                     Data JSON + unggahan (jika Supabase belum aktif)
├── supabase/schema.sql       SQL yang dijalankan di Supabase
├── src/                      Versi lama Express (tidak dipakai npm run dev)
└── README.md                 File ini
```

Jangan mengedit `components/*.html` di root untuk fitur baru. UI yang jalan adalah yang di `web/`.

---

## Cara cek stack / framework

Di PowerShell, dari folder proyek:

```powershell
Select-String -Path web\package.json -Pattern "next|react|redux|typescript|supabase"
npm ls --prefix web --depth=0
```

Yang harus terlihat: `next`, `react`, `react-dom`, `@reduxjs/toolkit`, `typescript`, `@supabase/supabase-js`.

Cek server:

```
http://localhost:3000/api/info
```

- `"supabase": false` → masih memakai folder `data/`
- `"supabase": true` → sudah terhubung ke Supabase
- `"jwt": true` → token login siap (di Vercel boleh `"jwtDedicated": false`)

---

## Menjalankan program

### Persiapan (sekali)

1. Install [Node.js](https://nodejs.org/).
2. Buka PowerShell:

```powershell
cd "E:\LMS platfrom paling baru\LMS-Platfrom-main"
npm install
npm install --prefix web
```

3. Salin `.env.example` di root menjadi `.env`, isi `JWT_SECRET` (wajib, dipakai token login aplikasi):

```powershell
copy .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Tempel hasilnya ke `JWT_SECRET=` di file `.env`.

### Start

Dari folder proyek:

```powershell
npm run dev
```

Perintah ini menjalankan Next.js di **semua alamat jaringan** (`0.0.0.0`), port **3000**.

### Buka di browser

- Laptop: [http://localhost:3000](http://localhost:3000)
- HP (Wi‑Fi yang sama): alamat LAN yang tampil di halaman Home, biasanya `http://192.168.x.x:3000`

Firewall Windows harus mengizinkan Node.js. Pakai URL `192.168....`, bukan alamat 26.x atau 172.19.x (sering virtual adapter).

### Stop / menonaktifkan

Program hidup selama terminal `npm run dev` masih terbuka. Menutup tab browser **tidak** mematikan server.

1. Klik terminal yang menjalankan server.
2. Tekan **Ctrl + C**.
3. Jika ditanya `Terminate batch job (Y/N)?`, ketik **Y** lalu Enter.

Jika masih nyangkut:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Data di folder `data/` (atau di Supabase) **tidak hilang** saat server dimatikan.

Jalankan lagi: `npm run dev`.

### Versi Express lama (opsional)

```powershell
npm run start:legacy
```

---

## Fitur yang sudah ada

### Akun

- Register / login sebagai **student** atau **admin**
- Password: minimal 6 karakter, ada huruf besar, huruf kecil, dan angka
- Reset password: daftar ulang dengan email yang sama untuk mengganti password

### Kelas

- Cari dan filter kategori
- Kelas **gratis** (`harga = 0`): tombol **Enroll**, langsung masuk dashboard
- Kelas **berbayar** (`harga > 0`): tombol **Tambah ke keranjang**
- Admin bisa buat / edit / hapus kelas, termasuk field **harga**

Contoh data awal:

- Web Development, UI/UX → gratis
- Business Management → Rp 150.000
- English for Professionals → Rp 200.000

### Keranjang & pembayaran kelas berbayar

Alur siswa:

1. Login sebagai student.
2. Courses → **Tambah ke keranjang**.
3. Menu **Keranjang**.
4. Transfer ke **rekening tujuan** yang tampil (ada tombol salin nomor).
5. Pilih **Bayar dari bank** (bank asal siswa: BCA, Mandiri, BRI, dll.).
6. Isi catatan (nama pengirim, tanggal).
7. Unggah **bukti bayar** (gambar atau PDF).
8. Status: **Menunggu aktivasi dosen**. Kelas belum bisa dikerjakan.

Alur admin/dosen:

1. Login sebagai admin.
2. **Admin Panel** → **Aktivasi kelas berbayar**.
3. Lihat bukti, catatan, dan teks **Dibayar dari: [nama bank]**.
4. **Aktifkan kelas** atau **Tolak**.

Setelah diaktifkan, kelas muncul di dashboard siswa.

Rekening tujuan bisa diubah admin di **Rekening tujuan pembayaran** (bank, nomor, atas nama, instruksi). Siswa langsung melihat data baru di keranjang.

Riwayat pembayaran (siswa & admin) menampilkan bank **asal** transfer siswa.

Ini **bukan** gateway otomatis (Midtrans dll.). Siswa transfer manual, dosen yang mengaktifkan.

### Tugas (termasuk video)

Siswa yang kelasnya sudah aktif, di Dashboard → **Submit assignment** bisa:

- menulis teks, dan/atau
- unggah **video** (mp4, webm, mov), audio, PDF, gambar, Word, atau ZIP  
  Maksimal **80 MB**

Dosen di **Assignment Grading** bisa memutar video / membuka file, lalu memberi nilai 0–100 dan feedback.

Siswa bisa **update** tugas selama belum dinilai.

---

## Halaman aplikasi

| URL | Fungsi |
|---|---|
| `/` | Home + alamat akses HP |
| `/courses` | Daftar kelas |
| `/login` | Login & register |
| `/cart` | Keranjang, rekening, bukti bayar (siswa) |
| `/dashboard` | Kelas aktif, tugas, progress, status bayar (siswa) |
| `/admin` | Kelola kelas, nilai tugas, rekening, aktivasi bayar |

---

## Menyimpan data

### Mode A — file JSON (default, tanpa Supabase)

Folder `data/`:

- `users.json`, `courses.json`, `enrollments.json`
- `assignments.json`, `orders.json`
- `payment-settings.json` (rekening tujuan)
- `uploads/` (video & bukti bayar)

### Mode B — Supabase

Jika `web/.env.local` berisi URL dan key Supabase:

- User & password: **Authentication**
- Tabel: `profiles`, `courses`, `enrollments`, `assignments`, `orders`, `bank_accounts`
- File: Storage bucket `assignments` dan `payments`

---

## Menghubungkan ke Supabase (dari awal)

Kode sudah ada di `web/lib/supabase.ts`. Aplikasi **tetap jalan tanpa Supabase** sampai key diisi.

### 1. Buat project

1. Buka [https://supabase.com](https://supabase.com) → daftar / masuk.
2. **New project** (nama contoh: `lms-platform`).
3. Simpan database password.
4. Region: **Singapore**.
5. Tunggu status **Ready**.

### 2. Jalankan SQL

1. Dashboard → **SQL Editor** → **New query**.
2. Buka file `supabase/schema.sql` di folder proyek.
3. Salin seluruh isi → tempel → **Run**.
4. **Table Editor** harus menampilkan tabel `profiles`, `courses`, `orders`, dan lainnya.

### 3. Email (untuk tes di laptop)

**Authentication** → **Providers** → **Email** → matikan **Confirm email** agar register langsung bisa login.

### 4. Ambil kunci

**Project Settings** → **API**:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**rahasia**, jangan dibagikan, jangan commit ke Git)

### 5. File lingkungan

Salin `web/.env.example` menjadi `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

File `web/.env.local` sudah diabaikan Git.

### 6. Restart

```powershell
cd "E:\LMS platfrom paling baru\LMS-Platfrom-main\web"
npm install
npm run dev
```

Cek [http://localhost:3000/api/info](http://localhost:3000/api/info) → `"supabase": true`.

### 7. Tes

1. Register user baru di LMS.
2. Di Supabase: **Authentication → Users** ada email itu.
3. **Table Editor → profiles** ada nama dan role.

Jika `"supabase": false`: `.env.local` belum diisi atau server belum di-restart.

---

## Menghubungkan ke Vercel (online)

Vercel **tidak** punya file seperti `schema.sql`. Yang di GitHub hanya kode + `web/vercel.json`. Kunci dan pengaturan ada di **dashboard Vercel**.

Repo GitHub yang dipakai:

https://github.com/Mardianto-coder/learning-management-system-new

### 1. Buat project

1. Buka [https://vercel.com](https://vercel.com) → masuk dengan GitHub.
2. **Add New → Project** → import repo di atas.
3. **Framework Preset:** Next.js (kadang terkunci otomatis setelah Root dipilih).
4. **Root Directory:** klik **Edit** → pilih folder **`web`** (ada logo N). Jangan `/` dan jangan `supabase`.
5. **Output Directory:** jangan diisi `public`. Biarkan default Next.js (Override mati).

### 2. Environment Variables

File `web/.env.local` **tidak** ikut ke GitHub. Salin kuncinya ke Vercel → **Settings → Environment Variables**.

| Key | Jenis di Vercel | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** (bukan Secret) | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Config** | kunci anon (`eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | kunci service_role |
| `JWT_SECRET` | **Secret** | secret acak; isi dari `web/.env.local` |
| `JWT_EXPIRES_IN` | Config atau Secret | `24h` |

Nama yang diawali `NEXT_PUBLIC_` **wajib Config**. Kalau dipilih Secret, Vercel menolak simpan.

Centang **Production** (boleh juga Preview). Setelah menambah/mengubah env: **Deployments → ⋯ → Redeploy** (jangan centang build cache). Push kode baru ke `main` biasanya deploy otomatis; Redeploy manual hanya perlu jika yang berubah hanya env.

### 3. Cek

Setelah status **Ready**:

```
https://NAMA-PROJECT.vercel.app/api/info
```

Harus `"supabase": true` dan `"jwt": true`.

Situs produksi: [https://learning-management-system-new-zeta.vercel.app](https://learning-management-system-new-zeta.vercel.app)

Laptop (`localhost`) dan Vercel memakai **project Supabase yang sama**. Daftar di Vercel → user muncul di **Authentication → Users**.

Jangan buka URL deploy lama (kode acak di tengah nama). Pakai URL **Visit** / domain `…-zeta.vercel.app`.

### 4. Build gagal yang pernah terjadi

| Pesan log | Perbaikan |
|---|---|
| `Variable 'proof' implicitly has type 'any'` | sudah diperbaiki di kode checkout |
| `No Output Directory named "public"` | Root Directory = `web`, jangan Output `public`; ada `web/vercel.json` |
| Register: `JWT_SECRET is not configured` | isi `JWT_SECRET` di Vercel lalu Redeploy. Jika `"jwtDedicated": false` tapi `"jwt": true`, login tetap jalan (cadangan kunci Supabase) |
| `A user with this email has already been registered` | email itu sudah ada di Supabase → pakai **Login**, bukan Register |

---

## Perintah npm

Dari folder proyek (`LMS-Platfrom-main`):

| Perintah | Arti |
|---|---|
| `npm run dev` | Jalankan aplikasi Next.js (laptop + HP) |
| `npm start` | Production Next.js (perlu `npm run build --prefix web` dulu) |
| `npm install --prefix web` | Install paket React/Next/Redux/Supabase |
| `npm run start:legacy` | Server Express lama |

Dari folder `web/`: `npm run dev` sama saja.

---

## Cache npm di drive E (jika C: penuh)

Error `ENOSPC: no space left on device` artinya drive C: penuh (cache npm default di `AppData`). Proyek ada di E:.

```powershell
mkdir E:\npm-cache -Force
npm config set cache "E:\npm-cache"
```

Hentikan server dulu sebelum `npm install` / `npm audit fix` agar tidak `EPERM`.

`npm audit fix` **tidak wajib** supaya aplikasi jalan. Jangan `npm audit fix --force` kecuali siap aplikasi rusak.

---

## Masalah umum

| Gejala | Penyebab / solusi |
|---|---|
| `localhost:3000` tidak buka | Belum `npm run dev`, atau port 3000 dipakai proses lain |
| HP tidak bisa buka | Bukan Wi‑Fi yang sama, firewall, atau memakai IP yang salah |
| Kelas berbayar tidak muncul di dashboard | Belum dibayar, atau admin belum **Aktifkan kelas** |
| Upload video gagal | File > 80 MB atau tipe tidak didukung |
| Register/login error setelah Supabase | SQL belum di-run, Confirm email masih nyala, atau key salah |
| `npm audit fix` gagal ENOSPC | Kosongkan C: atau pindahkan cache npm ke E: |

---

## Catatan

- Tutup browser ≠ stop program.
- Versi lama HTML di `src/` dan `components/` root **bukan** aplikasi yang dijalankan `npm run dev`.
- Dokumentasi file `.md` lama di root (API Express, dll.) merujuk versi sebelumnya; panduan yang benar untuk aplikasi sekarang adalah **file README ini**.
