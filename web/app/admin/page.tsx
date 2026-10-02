'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import Modal from '@/components/Modal';
import FilePreview from '@/components/FilePreview';
import PaymentHistoryLine from '@/components/PaymentHistoryLine';
import {
  createCourse,
  deleteCourse,
  getAllAssignments,
  getAllCourses,
  getOrders,
  getPaymentInfo,
  getStudents,
  gradeAssignment,
  reviewOrder,
  savePaymentInfo,
  updateCourse,
  updateStudentAcademic,
} from '@/lib/client-api';
import { formatRupiah } from '@/lib/format';
import { SEMESTER_OPTIONS, YEAR_OPTIONS, type StudentProfile } from '@/lib/student-profile';
import { useAppSelector } from '@/store/hooks';
import type { Assignment, BankAccount, Course, CourseCategory, Order, PaymentSettings } from '@/lib/types';

type Panel = 'courses' | 'grading' | 'banks' | 'orders' | 'students';

const MENU: { id: Panel; label: string; hint: string }[] = [
  { id: 'courses', label: 'Kelola kelas', hint: 'Tambah, ubah, atau hapus kelas' },
  { id: 'grading', label: 'Nilai tugas', hint: 'Tugas siswa yang perlu dinilai' },
  { id: 'banks', label: 'Rekening tujuan', hint: 'Nomor rekening untuk transfer siswa' },
  { id: 'orders', label: 'Aktivasi bayar', hint: 'Aktifkan kelas setelah bukti transfer' },
  { id: 'students', label: 'Data akademik siswa', hint: 'Isi program studi, NIM, status kuliah' },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, ready } = useAppSelector((s) => s.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [error, setError] = useState('');
  const [courseModal, setCourseModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [grading, setGrading] = useState<Assignment | null>(null);
  const [panel, setPanel] = useState<Panel>('courses');
  const [menuOpen, setMenuOpen] = useState(false);
  const [students, setStudents] = useState<{ id: number; name: string; email: string; profile: StudentProfile }[]>([]);
  const [studentId, setStudentId] = useState<number | ''>('');
  const [academic, setAcademic] = useState<StudentProfile | null>(null);
  const [studentName, setStudentName] = useState('');
  const [academicOk, setAcademicOk] = useState('');

  async function reload() {
    const [c, a, o, p, s] = await Promise.all([
      getAllCourses(),
      getAllAssignments(),
      getOrders(),
      getPaymentInfo(),
      getStudents(),
    ]);
    setCourses(c);
    setAssignments(a);
    setOrders(o);
    setPayment(p);
    setStudents(s);
  }

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    reload().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load admin data'));
  }, [ready, user, router]);

  const current = MENU.find((item) => item.id === panel)!;

  function openPanel(id: Panel) {
    setPanel(id);
    setMenuOpen(false);
  }

  async function onSaveCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get('title')),
      description: String(form.get('description')),
      category: String(form.get('category')) as CourseCategory,
      duration: Number(form.get('duration')),
      price: Number(form.get('price') || 0),
    };
    try {
      setError('');
      if (editing) {
        await updateCourse(editing.id, payload);
      } else {
        await createCourse(payload);
      }
      setCourseModal(false);
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
    }
  }

  async function onGrade(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!grading) return;
    const form = new FormData(e.currentTarget);
    try {
      setError('');
      await gradeAssignment(grading.id, Number(form.get('score')), String(form.get('feedback') || ''));
      setGrading(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade');
    }
  }

  if (!ready || !user || user.role !== 'admin') return <main className="page">Loading...</main>;

  return (
    <main className="page dash-page">
      {menuOpen ? (
        <button type="button" className="dash-backdrop" aria-label="Tutup menu" onClick={() => setMenuOpen(false)} />
      ) : null}

      <aside className={`dash-drawer${menuOpen ? ' open' : ''}`}>
        <p className="dash-drawer-kicker">Menu admin</p>
        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dash-drawer-item${panel === item.id ? ' active' : ''}`}
            onClick={() => openPanel(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </aside>

      <div className="container dash-shell">
        <header className="dash-top">
          <button type="button" className="dash-burger" aria-label="Buka menu admin" onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
          <div>
            <p className="dash-hello">Halo, {user.name}</p>
            <h1>{current.label}</h1>
            <p className="dash-sub">{current.hint}</p>
          </div>
        </header>

        {error ? <div className="status-info error">{error}</div> : null}

        {panel === 'courses' ? (
          <section className="dash-panel">
            <div className="section-header">
              <h2>Daftar kelas</h2>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditing(null);
                  setCourseModal(true);
                }}
              >
                + Kelas baru
              </button>
            </div>
            {courses.length === 0 ? <p className="dash-empty">Belum ada kelas.</p> : null}
            <div className="courses-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  actions={
                    <>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setEditing(course);
                          setCourseModal(true);
                        }}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={async () => {
                          if (!confirm('Hapus kelas ini?')) return;
                          await deleteCourse(course.id);
                          await reload();
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        {panel === 'grading' ? (
          <section className="dash-panel">
            {assignments.length === 0 ? <p className="dash-empty">Tidak ada tugas.</p> : null}
            <div className="tasks-list">
              {assignments.map((item) => (
                <article className="task-item" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>
                    {item.studentName} — {item.courseTitle}
                  </p>
                  <span className={`task-status ${item.status}`}>
                    {item.status === 'graded' ? 'Sudah dinilai' : item.status === 'submitted' ? 'Menunggu nilai' : item.status}
                  </span>
                  {item.status === 'submitted' ? (
                    <button type="button" className="btn btn-primary" onClick={() => setGrading(item)}>
                      Nilai
                    </button>
                  ) : item.status === 'graded' ? (
                    <p>Nilai: {item.score}</p>
                  ) : null}
                  <FilePreview file={item.attachment} />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {panel === 'banks' ? (
          <section className="dash-panel">
            <p className="dash-muted">Siswa melihat rekening ini di keranjang sebelum transfer.</p>
            {payment ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  const banks = form.getAll('bank').map(String);
                  const numbers = form.getAll('accountNumber').map(String);
                  const names = form.getAll('accountName').map(String);
                  const accounts: BankAccount[] = banks.map((bank, index) => ({
                    id: index + 1,
                    bank,
                    accountNumber: numbers[index] || '',
                    accountName: names[index] || '',
                  }));
                  try {
                    setError('');
                    const result = await savePaymentInfo({
                      instruction: String(form.get('instruction') || ''),
                      accounts,
                    });
                    setPayment(result.payment);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Gagal simpan rekening');
                  }
                }}
              >
                <div className="form-group">
                  <label>Instruksi transfer</label>
                  <textarea name="instruction" rows={3} defaultValue={payment.instruction} key={payment.instruction} />
                </div>
                {payment.accounts.map((account) => (
                  <div className="bank-account" key={account.id}>
                    <div className="form-group">
                      <label>Bank</label>
                      <input name="bank" required defaultValue={account.bank} />
                    </div>
                    <div className="form-group">
                      <label>Nomor rekening</label>
                      <input name="accountNumber" required defaultValue={account.accountNumber} />
                    </div>
                    <div className="form-group">
                      <label>Atas nama</label>
                      <input name="accountName" required defaultValue={account.accountName} />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setPayment({
                      ...payment,
                      accounts: [
                        ...payment.accounts,
                        { id: Date.now(), bank: '', accountNumber: '', accountName: '' },
                      ],
                    })
                  }
                >
                  + Tambah rekening
                </button>
                <button type="submit" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>
                  Simpan rekening
                </button>
              </form>
            ) : null}
          </section>
        ) : null}

        {panel === 'orders' ? (
          <section className="dash-panel">
            {orders.length === 0 ? <p className="dash-empty">Belum ada pembayaran siswa.</p> : null}
            {orders.map((order) => (
              <article className="task-item" key={order.id}>
                <h4>
                  #{order.id} — {order.studentName} ({order.studentEmail})
                </h4>
                <p>{order.items.map((item) => `${item.title} (${formatRupiah(item.price)})`).join(', ')}</p>
                <p>Total: {formatRupiah(order.total)}</p>
                <PaymentHistoryLine order={order} />
                {order.note ? <p>Catatan: {order.note}</p> : null}
                <span
                  className={`task-status ${order.status === 'activated' ? 'graded' : order.status === 'rejected' ? 'pending' : 'submitted'}`}
                >
                  {order.status === 'awaiting_activation'
                    ? 'Menunggu aktivasi'
                    : order.status === 'activated'
                      ? 'Sudah diaktifkan'
                      : 'Ditolak'}
                </span>
                <FilePreview file={order.proof} />
                {order.status === 'awaiting_activation' ? (
                  <div className="course-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={async () => {
                        await reviewOrder(order.id, 'activate');
                        await reload();
                      }}
                    >
                      Aktifkan kelas
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={async () => {
                        await reviewOrder(order.id, 'reject');
                        await reload();
                      }}
                    >
                      Tolak
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        {panel === 'students' ? (
          <section className="dash-panel">
            {academicOk ? <p className="dash-muted">{academicOk}</p> : null}
            {students.length === 0 ? (
              <p className="dash-empty">Belum ada siswa.</p>
            ) : (
              <>
                <div className="form-group">
                  <label>Pilih siswa</label>
                  <select
                    value={studentId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setStudentId(id);
                      const picked = students.find((item) => item.id === id);
                      setAcademic(picked?.profile || null);
                      setStudentName(picked?.name || '');
                      setAcademicOk('');
                    }}
                  >
                    <option value="">-Pilih siswa-</option>
                    {students.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.email})
                      </option>
                    ))}
                  </select>
                </div>
                {academic && studentId ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setError('');
                        const result = await updateStudentAcademic(Number(studentId), {
                          name: studentName,
                          ...academic,
                        });
                        setAcademicOk(result.message);
                        setStudents((prev) =>
                          prev.map((item) => (item.id === result.student.id ? result.student : item)),
                        );
                        setStudentName(result.student.name);
                        setAcademic(result.student.profile);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Gagal simpan data akademik');
                      }
                    }}
                  >
                    <div className="form-group">
                      <label>Nama</label>
                      <input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Program Studi</label>
                      <select
                        value={academic.programStudi}
                        onChange={(e) => setAcademic({ ...academic, programStudi: e.target.value })}
                      >
                        <option value="">-Pilih-</option>
                        <option value="programming">Pemrograman</option>
                        <option value="design">Desain</option>
                        <option value="business">Bisnis</option>
                        <option value="language">Bahasa</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tahun Masuk</label>
                      <select
                        value={academic.tahunMasuk}
                        onChange={(e) => setAcademic({ ...academic, tahunMasuk: e.target.value })}
                      >
                        <option value="">-Pilih-</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>NIM</label>
                      <input
                        value={academic.nim}
                        onChange={(e) => setAcademic({ ...academic, nim: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Kelas</label>
                      <select
                        value={academic.kelas}
                        onChange={(e) => setAcademic({ ...academic, kelas: e.target.value })}
                      >
                        <option value="">-Pilih Kelas-</option>
                        {courses.map((course) => (
                          <option key={course.id} value={String(course.id)}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Jenis Kelamin</label>
                      <select
                        value={academic.gender}
                        onChange={(e) => setAcademic({ ...academic, gender: e.target.value })}
                      >
                        <option value="">-Pilih-</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status Kuliah</label>
                      <select
                        value={academic.statusKuliah}
                        onChange={(e) => setAcademic({ ...academic, statusKuliah: e.target.value })}
                      >
                        <option value="">-Pilih-</option>
                        <option value="aktif">Aktif</option>
                        <option value="cuti">Cuti</option>
                        <option value="lulus">Lulus</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mulai Semester</label>
                      <select
                        value={academic.mulaiSemester}
                        onChange={(e) => setAcademic({ ...academic, mulaiSemester: e.target.value })}
                      >
                        <option value="">-Pilih-</option>
                        {SEMESTER_OPTIONS.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Simpan data akademik
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </section>
        ) : null}
      </div>

      <Modal open={courseModal} onClose={() => setCourseModal(false)} title={editing ? 'Ubah kelas' : 'Kelas baru'}>
        <form onSubmit={onSaveCourse}>
          <div className="form-group">
            <label>Judul kelas</label>
            <input name="title" required defaultValue={editing?.title || ''} />
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea name="description" rows={4} required defaultValue={editing?.description || ''} />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <select name="category" defaultValue={editing?.category || 'programming'}>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="language">Language</option>
            </select>
          </div>
          <div className="form-group">
            <label>Durasi (jam)</label>
            <input name="duration" type="number" required defaultValue={editing?.duration || 10} />
          </div>
          <div className="form-group">
            <label>Harga (Rp) — isi 0 untuk kelas gratis</label>
            <input name="price" type="number" min={0} defaultValue={editing?.price || 0} />
          </div>
          <button type="submit" className="btn btn-primary">
            Simpan kelas
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(grading)} onClose={() => setGrading(null)} title="Nilai tugas">
        {grading ? (
          <form onSubmit={onGrade}>
            <p>
              <strong>Siswa:</strong> {grading.studentName}
            </p>
            <p>
              <strong>Kelas:</strong> {grading.courseTitle}
            </p>
            <p>
              <strong>Judul:</strong> {grading.title}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', margin: '1rem 0' }}>{grading.content}</p>
            <FilePreview file={grading.attachment} />
            <div className="form-group">
              <label>Nilai (0-100)</label>
              <input name="score" type="number" min={0} max={100} required />
            </div>
            <div className="form-group">
              <label>Masukan (opsional)</label>
              <textarea name="feedback" rows={4} />
            </div>
            <button type="submit" className="btn btn-primary">
              Simpan nilai
            </button>
          </form>
        ) : null}
      </Modal>
    </main>
  );
}
