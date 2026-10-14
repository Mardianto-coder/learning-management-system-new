import type { Lesson } from './types';

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Pertemuan 1 — HTML dasar',
    content:
      'Buat halaman HTML sederhana: heading, paragraf, dan tautan. Ini materi pembuka kelas Web Development.',
    sortOrder: 1,
  },
  {
    id: 2,
    courseId: 1,
    title: 'Pertemuan 2 — CSS dan tata letak',
    content: 'Gunakan CSS untuk warna, spasi, dan layout. Coba buat kartu kursus seperti di katalog LMS ini.',
    sortOrder: 2,
  },
  {
    id: 3,
    courseId: 2,
    title: 'Pertemuan 1 — Prinsip UI',
    content: 'Hierarki visual, kontras, dan jarak. Bandingkan dua tampilan: ramai vs rapi.',
    sortOrder: 1,
  },
  {
    id: 4,
    courseId: 2,
    title: 'Pertemuan 2 — Alur pengguna',
    content: 'Gambar alur daftar → login → dashboard. Catat di mana pengguna bisa bingung.',
    sortOrder: 2,
  },
  {
    id: 5,
    courseId: 3,
    title: 'Pertemuan 1 — Tujuan tim',
    content: 'Tulis tujuan SMART untuk satu proyek kampus. Kelas berbayar: materi hanya untuk siswa yang sudah diaktifkan.',
    sortOrder: 1,
  },
  {
    id: 6,
    courseId: 4,
    title: 'Pertemuan 1 — Email profesional',
    content: 'Susun email singkat: subject, sapaan, isi, penutup. Latihan 8–10 kalimat.',
    sortOrder: 1,
  },
];
