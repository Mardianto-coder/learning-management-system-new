# Panduan lengkap LMS (awal sampai sekarang)

Dokumen ini mencatat **semua yang sudah dikerjakan**, urut dari awal. Cara menjalankan harian tetap di [`README.md`](README.md).

**Hasil akhir**

| Tempat | Alamat |
| --- | --- |
| Laptop | `E:\LMS platfrom paling baru\LMS-Platfrom-main` → folder `web/` |
| GitHub | https://github.com/Mardianto-coder/learning-management-system-new |
| Situs | https://learning-management-system-new-zeta.vercel.app |
| Database | Project Supabase (tabel + Auth + Storage) |

---

## Daftar isi

1. [Drive C penuh & npm](#1-drive-c-penuh--npm)
2. [Program jalan & cara stop](#2-program-jalan--cara-stop)
3. [Akses laptop dan HP](#3-akses-laptop-dan-hp)
4. [Ganti stack ke Next.js](#4-ganti-stack-ke-nextjs)
5. [Fitur kelas berbayar & tugas file](#5-fitur-kelas-berbayar--tugas-file)
6. [Supabase](#6-supabase)
7. [GitHub](#7-github)
8. [Vercel](#8-vercel)
9. [Login di HP vs laptop](#9-login-di-hp-vs-laptop)
10. [React Hooks dan Redux](#10-react-hooks-dan-redux)
11. [Dokumentasi](#11-dokumentasi)
12. [Cek cepat semua sudah nyambung](#12-cek-cepat-semua-sudah-nyambung)

---

## 1. Drive C penuh & npm

**Masalah:** `npm install` / `npm audit fix` error `ENOSPC` (C: penuh) atau `EPERM` (file terkunci karena server masih hidup).

**Yang dilakukan**

- Cache npm dipindah ke drive E:

```powershell
mkdir E:\npm-cache -Force
npm config set cache "E:\npm-cache"
```

- Server dihentikan dulu sebelum install/audit.
- `npm audit fix` **tidak wajib**. Jangan `--force`.

**Sekarang:** aplikasi tidak bergantung pada audit; yang wajib adalah `npm install` dan `npm install --prefix web`.

---

## 2. Program jalan & cara stop

**Masalah:** bingung apakah app sudah jalan; cara mematikan tidak ketemu karena file `CARA_MENJALANKAN_API.md` (Express lama).

**Yang dilakukan**

- Aplikasi dijalankan dengan `npm run dev`.
- Stop: terminal → **Ctrl + C** → **Y**. Tutup browser **tidak** mematikan server.
- Data tidak hilang saat server mati.

---

## 3. Akses laptop dan HP

**Masalah:** hanya `localhost`, HP tidak bisa buka.

**Yang dilakukan**

- Next.js listen `0.0.0.0:3000`.
- Laptop: http://localhost:3000
- HP (Wi‑Fi sama): `http://192.168.x.x:3000` (lihat halaman Home).
- Pakai IP `192.168.…`, bukan `26.x` / `172.19.x`.

---

## 4. Ganti stack ke Next.js

**Permintaan:** TypeScript, React, HTML, CSS, Redux, Next.js.

**Yang dilakukan**

- Aplikasi baru di **`web/`** (bukan `src/` Express).
- `package.json` akar: `npm run dev` / `npm start` mengarah ke `web/`.
- Express lama: `npm run start:legacy` (opsional).

| Layer | Isi |
| --- | --- |
| Halaman | `web/app/` (`/`, `/courses`, `/login`, `/cart`, `/dashboard`, `/admin`) |
| API | `web/app/api/` |
| Redux | `web/store/` (auth, courses, cart) |
| UI | `web/components/` + CSS |

Cek stack: `web/package.json` harus berisi `next`, `react`, `@reduxjs/toolkit`, `typescript`, `@supabase/supabase-js`.

---

## 5. Fitur kelas berbayar & tugas file

**Yang ditambahkan**

1. Kelas **gratis** → Enroll. Kelas **berbayar** → keranjang.
2. Rekening **tujuan** (admin bisa ubah).
3. Siswa pilih **bank asal**, unggah bukti, status menunggu aktivasi.
4. Admin **aktifkan** atau **tolak**. Riwayat: **Dibayar dari: …**
5. Tugas: teks + file (video, audio, PDF, gambar, Word, ZIP), maks **80 MB**.
6. Dosen nilai 0–100; siswa bisa ubah tugas sebelum dinilai.

Ini **bukan** Midtrans. Transfer manual.

---

## 6. Supabase

**Sifat:** opsional. Tanpa kunci → folder `data/` (JSON). Dengan kunci → cloud.

### File SQL

`supabase/schema.sql` — dijalankan di **SQL Editor** Supabase (bukan di laptop).

Saat menghubungkan repo GitHub di dashboard Supabase, **Working directory = `.`** (titik). Jangan diisi `supabase/`.

### `web/.env.local` (laptop)

```env
JWT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- URL harus `https://….supabase.co`, **bukan** teks `eyJ…`.
- `eyJ…` hanya untuk anon dan service_role.
- File ini di `.gitignore` (aman tidak ikut GitHub).

### Yang harus terlihat jika sukses

1. `/api/info` → `"supabase": true`
2. **Authentication → Users** ada email daftar
3. **Table Editor → profiles** ada nama, email, role

Matikan **Confirm email** di Auth supaya tes login langsung.

---

## 7. GitHub

Repo tujuan: **Mardianto-coder/learning-management-system-new** (awalnya hanya README kosong).

- Histori GitHub digabung dengan proyek lokal; README LMS yang dipakai.
- **Tidak** di-commit: `.env`, `web/.env.local`, `data/`, `node_modules/`.
- Aturan ada di `.gitignore` + saat commit.

Cabang: `main`. Push biasa memicu deploy Vercel.

---

## 8. Vercel

Vercel **tidak** punya folder di repo. Hanya `web/vercel.json` (framework Next.js). Kunci diisi di dashboard.

### Pengaturan project

| Setting | Isi |
| --- | --- |
| Root Directory | **`web`** |
| Output Directory | **jangan** `public` |
| Framework | Next.js (boleh terkunci otomatis) |

### Environment Variables

| Key | Jenis |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Config** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** |
| `JWT_SECRET` | **Secret** |
| `JWT_EXPIRES_IN` | Config atau Secret |

`NEXT_PUBLIC_*` tidak boleh Secret (akan error merah).

Ubah env saja → **Redeploy** tanpa build cache. Push kode → deploy otomatis.

### Error yang sudah diperbaiki di kode

| Log | Perbaikan |
| --- | --- |
| `proof` implicitly `any` | tipe TypeScript di `orders/route.ts` |
| No Output Directory `public` | `web/vercel.json` + Root = `web` |

Cek: `https://learning-management-system-new-zeta.vercel.app/api/info`  
Harus `"supabase": true` dan `"jwt": true`. Pakai URL **Visit**, bukan URL deploy lama (`…rbnz6jn4…`).

---

## 9. Login di HP vs laptop

Dua pesan berbeda **bukan** dua aplikasi.

| Pesan | Arti | Tindakan |
| --- | --- | --- |
| Email already registered | Email sudah ada di Supabase | **Login**, atau daftar email baru |
| `JWT_SECRET is not configured` | Token login belum terbaca di deploy itu | URL zeta + `"jwt": true` |

`JWT_SECRET` di Vercel sering tidak ikut ke server (`"jwtDedicated": false`). Kode sekarang **cadangan:** tanda tangan token memakai `SUPABASE_SERVICE_ROLE_KEY` jika JWT kosong. Itu sebab `"jwt": true` tetap muncul.

Lupa password `kura@gmail.com`: daftar **email baru** (fitur lupa password belum ada).

---

## 10. React Hooks dan Redux

**Ada.** Hanya di komponen klien (`web/app/`, `web/components/`).

| Hook | Kegunaan di LMS |
| --- | --- |
| `useState` | Form, modal, error |
| `useEffect` | Ambil API, cek login, hydrate |
| `useMemo` | Filter kelas |
| `useAppSelector` / `useAppDispatch` | Baca/ubah Redux |

Redux (`web/store/`): **auth**, **courses**, **cart**. Tugas dan order memakai `useState` di halaman dashboard/admin.

---

## 11. Dokumentasi

1. README lama diganti isi Next.js + fitur baru.
2. Bagian Vercel ditambahkan (tadinya hanya Supabase).
3. README dirapikan (daftar isi, tabel).
4. Semua `.md` Express lama dihapus (`CARA_*`, `FIX_*`, `QUICK_*`, dll.).

**Sekarang hanya dua panduan**

| File | Isi |
| --- | --- |
| `README.md` | Cara pakai hari ini |
| `PANDUAN.md` | File ini: urutan kerja dari awal |

---

## 12. Cek cepat semua sudah nyambung

1. GitHub: folder `web/`, `supabase/schema.sql`, README, `PANDUAN.md`.
2. Laptop: `npm run dev` → http://localhost:3000
3. `/api/info` lokal: supabase sesuai `.env.local`
4. Vercel `/api/info`: `"supabase": true`, `"jwt": true`
5. Daftar akun → muncul di Supabase **Users** dan **profiles**
6. HP: buka URL **zeta.vercel.app** (bukan deploy lama)

Rahasia tetap di laptop (`web/.env.local`) dan dashboard Vercel, bukan di GitHub.
