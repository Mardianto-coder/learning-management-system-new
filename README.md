# LMS Platform

Learning Management System untuk **siswa** dan **admin/dosen**.

Aplikasi yang dijalankan ada di folder **`web/`** (Next.js). Versi Express/HTML lama di `src/` **tidak** dipakai oleh `npm run dev`.

**Situs online:** [learning-management-system-new-zeta.vercel.app](https://learning-management-system-new-zeta.vercel.app)  
**Kode:** [github.com/Mardianto-coder/learning-management-system-new](https://github.com/Mardianto-coder/learning-management-system-new)

Folder di laptop:

```
E:\LMS platfrom paling baru\LMS-Platfrom-main
```

Cara pakai harian ada di bawah. Urutan kerja dari awal sampai Vercel ada di **[PANDUAN.md](PANDUAN.md)**.

---

## Isi panduan

1. [Teknologi](#teknologi)
2. [Struktur folder](#struktur-folder)
3. [Jalankan di laptop](#jalankan-di-laptop)
4. [Fitur](#fitur)
5. [Halaman](#halaman)
6. [Data: JSON atau Supabase](#data-json-atau-supabase)
7. [Hubungkan Supabase](#hubungkan-supabase)
8. [Hubungkan Vercel](#hubungkan-vercel)
9. [Perintah npm](#perintah-npm)
10. [Masalah umum](#masalah-umum)

---

## Teknologi

| Bagian | Dipakai |
| --- | --- |
| Bahasa & UI | TypeScript, React, HTML, CSS |
| Framework | Next.js 15 (App Router) |
| State | Redux Toolkit + React Hooks (`useState`, `useEffect`, `useMemo`) |
| Database | Supabase (opsional) atau file JSON di `data/` |
| Hosting | Vercel (dashboard, bukan folder di repo) |

Redux menyimpan **login, daftar kelas, keranjang**. Hook React dipakai di halaman (`web/app/`) dan komponen (`web/components/`).

Cek paket terpasang:

```powershell
Select-String -Path web\package.json -Pattern "next|react|redux|typescript|supabase"
npm ls --prefix web --depth=0
```

Cek status server: [http://localhost:3000/api/info](http://localhost:3000/api/info) (atau `/api/info` di URL Vercel).

| Nilai | Arti |
| --- | --- |
| `"supabase": false` | Data masih di folder `data/` |
| `"supabase": true` | Terhubung ke Supabase |
| `"jwt": true` | Token login siap |
| `"jwtDedicated": false` | JWT Vercel kosong; aplikasi memakai cadangan kunci Supabase (tetap bisa login) |

---

## Struktur folder

```
LMS-Platfrom-main/
├── web/                      Aplikasi utama
│   ├── app/                  Halaman & API
│   ├── components/           Navbar, modal, rekening, pratinjau file
│   ├── store/                Redux: auth, courses, cart
│   ├── lib/                  Storage, upload, Supabase
│   ├── .env.example          Contoh kunci (jangan isi rahasia di sini)
│   └── vercel.json           Pengaturan Vercel = Next.js
├── supabase/schema.sql       SQL untuk dashboard Supabase
├── data/                     JSON + unggahan (jika Supabase off)
└── src/                      Express lama (opsional)
```

UI baru ada di `web/`. Jangan menambah fitur di `components/*.html` di akar repo.

---

## Jalankan di laptop

### 1. Persiapan (sekali)

1. Pasang [Node.js](https://nodejs.org/).
2. Di PowerShell:

```powershell
cd "E:\LMS platfrom paling baru\LMS-Platfrom-main"
npm install
npm install --prefix web
copy web\.env.example web\.env.local
```

3. Buka `web/.env.local`. Isi `JWT_SECRET` (wajib untuk login lokal):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Tempel hasilnya ke `JWT_SECRET=`. Tiga baris Supabase boleh kosong dulu.

File `web/.env.local` **tidak** diunggah ke GitHub.

### 2. Start

```powershell
npm run dev
```

Server listen di `0.0.0.0:3000` (laptop + HP satu Wi‑Fi).

| Perangkat | Alamat |
| --- | --- |
| Laptop | [http://localhost:3000](http://localhost:3000) |
| HP | `http://192.168.x.x:3000` (lihat di halaman Home) |

Pakai IP `192.168....`. Hindari `26.x` atau `172.19.x` (adapter virtual). Izinkan Node.js di firewall Windows.

### 3. Stop

Menutup browser **tidak** mematikan server.

1. Klik terminal `npm run dev`.
2. **Ctrl + C** → jika ditanya, ketik **Y**.

Masih nyangkut di port 3000:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Data di `data/` atau di Supabase **tidak hilang**. Jalankan lagi dengan `npm run dev`.

Express lama (opsional): `npm run start:legacy`.

---

## Fitur

### Akun

- Daftar / masuk sebagai **student** atau **admin**.
- Password: minimal 6 karakter, ada huruf besar, huruf kecil, dan angka.
- Lupa password: daftar ulang dengan **email yang sama** (mengganti password). Reset lewat email belum ada.

### Kelas

- Cari dan filter kategori.
- **Gratis** (harga `0`): **Enroll** → langsung ke dashboard.
- **Berbayar** (harga `> 0`): **Tambah ke keranjang**.
- Admin bisa membuat / mengubah / menghapus kelas, termasuk harga.

Contoh data awal: Web Development & UI/UX **gratis**; Business Rp 150.000; English Rp 200.000.

### Bayar kelas (transfer manual)

Bukan Midtrans. Siswa transfer, dosen mengaktifkan.

**Siswa**

1. Login student → Courses → keranjang.
2. Transfer ke **rekening tujuan** (bisa disalin).
3. Pilih **bank asal** pembayaran.
4. Unggah bukti (gambar/PDF) + catatan.
5. Status: menunggu aktivasi — kelas belum bisa dikerjakan.

**Admin**

1. Admin Panel → aktivasi kelas berbayar.
2. Cek bukti dan teks **Dibayar dari: …**.
3. **Aktifkan** atau **Tolak**.

Rekening tujuan diubah di panel admin. Riwayat menampilkan bank **asal** siswa.

### Tugas (termasuk video)

Setelah kelas aktif, siswa bisa kirim teks dan/atau file: video (mp4/webm/mov), audio, PDF, gambar, Word, ZIP — maks **80 MB**. Dosen memutar/membuka file lalu nilai 0–100. Tugas bisa diubah selama belum dinilai.

---

## Halaman

| URL | Isi |
| --- | --- |
| `/` | Beranda + alamat untuk HP |
| `/courses` | Daftar kelas |
| `/login` | Login & register |
| `/cart` | Keranjang & bukti bayar |
| `/dashboard` | Kelas, tugas, status bayar (siswa) |
| `/admin` | Kelas, nilai, rekening, aktivasi |

---

## Data: JSON atau Supabase

**Tanpa Supabase** (`web/.env.local` kosong): data di `data/` (`users.json`, `courses.json`, `orders.json`, `uploads/`, …).

**Dengan Supabase:**

| Di Supabase | Isi |
| --- | --- |
| Authentication | Email & password |
| Tabel | `profiles`, `courses`, `enrollments`, `assignments`, `orders`, `bank_accounts` |
| Storage | bucket `assignments` dan `payments` |

Laptop dan Vercel bisa memakai **satu** project Supabase.

---

## Hubungkan Supabase

Aplikasi tetap jalan tanpa langkah ini.

1. [supabase.com](https://supabase.com) → **New project** (region Singapore) → tunggu **Ready**.
2. **SQL Editor** → tempel seluruh `supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email** → matikan **Confirm email** (untuk tes).
4. **Project Settings → API:** salin Project URL, kunci **anon**, kunci **service_role**.
5. Isi `web/.env.local`:

```env
JWT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

6. Restart `npm run dev`. Cek `/api/info` → `"supabase": true`.
7. Daftar akun di LMS. Di dashboard Supabase: **Users** dan tabel **profiles** harus ada baris baru.

Working directory saat menghubungkan repo GitHub di Supabase: biarkan **`.`** (folder `supabase/` sudah di akar repo).

---

## Hubungkan Vercel

Vercel **bukan** file SQL. Yang di GitHub: kode + `web/vercel.json`. Kunci diisi di dashboard.

### Project

1. [vercel.com](https://vercel.com) → import repo GitHub ini.
2. **Root Directory:** **`web`** (logo Next.js). Bukan `/`, bukan `supabase`.
3. **Output Directory:** jangan `public`. Biarkan default (Override mati).
4. Preset Next.js boleh terkunci setelah Root = `web`.

### Environment variables

`web/.env.local` tidak ikut Git. Salin ke **Settings → Environment Variables** (Production, boleh Preview).

| Key | Jenis | Isi |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** | `https://….supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Config** | kunci anon |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | kunci service_role |
| `JWT_SECRET` | **Secret** | sama seperti `.env.local` |
| `JWT_EXPIRES_IN` | Config atau Secret | `24h` |

Nama `NEXT_PUBLIC_*` **tidak boleh Secret** (Vercel akan menolak).

- Ubah env saja → **Deployments → ⋯ → Redeploy** (tanpa build cache).
- `git push` ke `main` → deploy otomatis.

### Cek

Status **Ready**, lalu buka `/api/info` di URL **Visit** (bukan URL deploy lama yang berisi kode acak).

Harus `"supabase": true` dan `"jwt": true`. Daftar di Vercel = user baru di Supabase.

---

## Perintah npm

Dari folder `LMS-Platfrom-main`:

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Next.js (laptop + HP) |
| `npm start` | Production (setelah `npm run build --prefix web`) |
| `npm install --prefix web` | Pasang paket di `web/` |
| `npm run start:legacy` | Express lama |

Sama saja jika `cd web` lalu `npm run dev`.

### Cache npm di drive E (C: penuh)

Error `ENOSPC` = disk C: penuh.

```powershell
mkdir E:\npm-cache -Force
npm config set cache "E:\npm-cache"
```

Hentikan server sebelum `npm install`. `npm audit fix` tidak wajib. Jangan `--force` kecuali siap aplikasi rusak.

---

## Masalah umum

| Gejala | Yang dicek |
| --- | --- |
| `localhost:3000` tidak buka | Belum `npm run dev`, atau port 3000 dipakai |
| HP tidak buka | Wi‑Fi berbeda, firewall, atau IP salah |
| Kelas berbayar tidak di dashboard | Belum bayar, atau admin belum aktifkan |
| Upload video gagal | File > 80 MB atau tipe tidak didukung |
| Login gagal setelah Supabase | SQL belum di-run, Confirm email nyala, atau kunci salah |
| Vercel: error folder `public` | Root Directory belum `web` |
| Vercel: `JWT_SECRET is not configured` | Isi `JWT_SECRET` + Redeploy, atau pastikan `"jwt": true` |
| Email already registered | Akun sudah ada di Supabase → **Login** |
| `npm audit fix` ENOSPC | Pindahkan cache npm ke E: |

---

## Catatan

- Tutup browser ≠ stop server.
- Jangan commit `.env`, `web/.env.local`, atau `data/`.
- Satu-satunya cara pakai harian: **README.md**. Riwayat kerja lengkap: **PANDUAN.md**.
