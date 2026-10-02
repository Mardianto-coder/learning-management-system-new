'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import Modal from '@/components/Modal';
import FilePreview from '@/components/FilePreview';
import PaymentHistoryLine from '@/components/PaymentHistoryLine';
import {
  changePassword,
  getMyProfile,
  getOrders,
  getStudentAssignments,
  getStudentCourses,
  submitAssignment,
  updateAssignment,
  updateMyProfile,
} from '@/lib/client-api';
import {
  loadLoginLog,
  recordLoginLog,
  SEMESTER_OPTIONS,
  YEAR_OPTIONS,
  type LocalStudentProfile,
  type LoginLogEntry,
  type ProfileTab,
} from '@/lib/student-profile';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import type { Assignment, Course, Order } from '@/lib/types';

type Panel =
  | 'home'
  | 'profile'
  | 'password'
  | 'files'
  | 'logins'
  | 'register'
  | 'courses'
  | 'tasks'
  | 'payments'
  | 'progress'
  | 'survey';

type NavGroup = 'akun' | 'registrasi' | 'kuliah' | null;

const TASK_LABEL: Record<'graded' | 'submitted' | 'pending', string> = {
  graded: 'Sudah dinilai',
  submitted: 'Menunggu nilai',
  pending: 'Belum selesai',
};

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'akademik', label: 'Data Akademik' },
  { id: 'pribadi', label: 'Data Pribadi' },
  { id: 'wali', label: 'Data Orang Tua / Wali' },
  { id: 'pendidikan', label: 'Data Pendidikan' },
  { id: 'akun', label: 'Data Akun' },
  { id: 'prestasi', label: 'Data Prestasi' },
];

const TITLES: Record<Panel, string> = {
  home: 'Dashboard',
  profile: 'Form',
  password: 'Ubah Password',
  files: 'Unduh Berkas',
  logins: 'Riwayat Login',
  register: 'Registrasi',
  courses: 'Perkuliahan',
  tasks: 'Tugas',
  payments: 'Pembayaran',
  progress: 'Nilai',
  survey: 'Survey',
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('id-ID');
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [courseId, setCourseId] = useState<number | ''>('');
  const [panel, setPanel] = useState<Panel>('profile');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<NavGroup>('akun');
  const [tab, setTab] = useState<ProfileTab>('akademik');
  const [profile, setProfile] = useState<LocalStudentProfile | null>(null);
  const [logs, setLogs] = useState<LoginLogEntry[]>([]);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'student') {
      router.replace(user.role === 'admin' ? '/admin' : '/');
      return;
    }
    recordLoginLog(user.id);
    setLogs(loadLoginLog(user.id));
    Promise.all([getStudentCourses(user.id), getStudentAssignments(user.id), getOrders(), getMyProfile()])
      .then(([c, a, o, me]) => {
        setCourses(c);
        setAssignments(a);
        setOrders(o);
        setProfile(me.profile);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, [ready, user, router]);

  const grouped = useMemo(
    () => ({
      graded: assignments.filter((a) => a.status === 'graded'),
      submitted: assignments.filter((a) => a.status === 'submitted'),
      pending: assignments.filter((a) => a.status === 'pending'),
    }),
    [assignments],
  );

  const files = useMemo(
    () =>
      assignments
        .filter((a) => a.attachment)
        .map((a) => ({ task: a, file: a.attachment! })),
    [assignments],
  );

  function openPanel(id: Panel, group: NavGroup = null) {
    setPanel(id);
    setError('');
    setOk('');
    if (group) setOpenGroup(group);
    setMenuOpen(false);
  }

  function toggleGroup(id: NavGroup) {
    setOpenGroup((cur) => (cur === id ? null : id));
  }

  function patchProfile(next: Partial<LocalStudentProfile>) {
    if (!profile) return;
    setProfile({ ...profile, ...next });
  }

  async function saveStudentFields() {
    if (!profile) return;
    setError('');
    setOk('');
    try {
      const res = await updateMyProfile({
        birthPlace: profile.birthPlace,
        birthDate: profile.birthDate,
        parentName: profile.parentName,
        parentRelation: profile.parentRelation,
        parentPhone: profile.parentPhone,
        lastSchool: profile.lastSchool,
        lastYear: profile.lastYear,
        achievement: profile.achievement,
        photoDataUrl: profile.photoDataUrl,
      });
      setProfile(res.profile);
      setOk(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil');
    }
  }

  function onPhoto(file: File | null) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (url.length > 1_200_000) {
        setError('Foto terlalu besar. Pakai gambar lebih kecil.');
        return;
      }
      patchProfile({ photoDataUrl: url });
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get('title'));
    const content = String(form.get('content'));
    const uploaded = form.get('file');
    const file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
    try {
      setError('');
      if (editing) {
        const updated = await updateAssignment(editing.id, { title, content, file });
        setAssignments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      } else {
        const created = await submitAssignment({ courseId: Number(courseId), title, content, file });
        setAssignments((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignment');
    }
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setPwBusy(true);
    setError('');
    setOk('');
    try {
      const res = await changePassword(String(data.get('currentPassword')), String(data.get('password')));
      setOk(res.message);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password');
    } finally {
      setPwBusy(false);
    }
  }

  if (!ready || !user || user.role !== 'student' || !profile) {
    return <main className="page">Loading...</main>;
  }

  const akunActive = panel === 'profile' || panel === 'password' || panel === 'files' || panel === 'logins';

  return (
    <div className="portal">
      {menuOpen ? <button type="button" className="portal-dim" aria-label="Tutup menu" onClick={() => setMenuOpen(false)} /> : null}

      <aside className={`portal-side${menuOpen ? ' open' : ''}`}>
        <nav className="portal-nav">
          <button type="button" className={panel === 'home' ? 'active' : ''} onClick={() => openPanel('home')}>
            Dashboards
          </button>

          <button type="button" className={`portal-parent${akunActive ? ' active' : ''}`} onClick={() => toggleGroup('akun')}>
            Akun
            <span>{openGroup === 'akun' ? '▾' : '▸'}</span>
          </button>
          {openGroup === 'akun' ? (
            <div className="portal-sub">
              <button type="button" className={panel === 'profile' ? 'active' : ''} onClick={() => openPanel('profile', 'akun')}>
                Edit Profil
              </button>
              <button type="button" className={panel === 'password' ? 'active' : ''} onClick={() => openPanel('password', 'akun')}>
                Ubah Password
              </button>
              <button type="button" className={panel === 'files' ? 'active' : ''} onClick={() => openPanel('files', 'akun')}>
                Unduh Berkas
              </button>
              <button type="button" className={panel === 'logins' ? 'active' : ''} onClick={() => openPanel('logins', 'akun')}>
                Riwayat Login
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className={`portal-parent${panel === 'register' ? ' active' : ''}`}
            onClick={() => toggleGroup('registrasi')}
          >
            Registrasi
            <span>{openGroup === 'registrasi' ? '▾' : '▸'}</span>
          </button>
          {openGroup === 'registrasi' ? (
            <div className="portal-sub">
              <button type="button" className={panel === 'register' ? 'active' : ''} onClick={() => openPanel('register', 'registrasi')}>
                Status kelas
              </button>
              <Link href="/courses" onClick={() => setMenuOpen(false)}>
                Katalog kelas
              </Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)}>
                Keranjang
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            className={`portal-parent${panel === 'courses' || panel === 'tasks' ? ' active' : ''}`}
            onClick={() => toggleGroup('kuliah')}
          >
            Perkuliahan
            <span>{openGroup === 'kuliah' ? '▾' : '▸'}</span>
          </button>
          {openGroup === 'kuliah' ? (
            <div className="portal-sub">
              <button type="button" className={panel === 'courses' ? 'active' : ''} onClick={() => openPanel('courses', 'kuliah')}>
                Kelas saya
              </button>
              <button type="button" className={panel === 'tasks' ? 'active' : ''} onClick={() => openPanel('tasks', 'kuliah')}>
                Tugas
              </button>
            </div>
          ) : null}

          <button type="button" className={panel === 'progress' ? 'active' : ''} onClick={() => openPanel('progress')}>
            Nilai
          </button>
          <button type="button" className={panel === 'payments' ? 'active' : ''} onClick={() => openPanel('payments')}>
            Pembayaran
          </button>
          <button type="button" className={panel === 'survey' ? 'active' : ''} onClick={() => openPanel('survey')}>
            Survey
          </button>
        </nav>
      </aside>

      <div className="portal-main">
        <header className="portal-bar">
          <button type="button" className="portal-burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
          <h1>{TITLES[panel]}</h1>
          <button
            type="button"
            className="portal-logout"
            onClick={() => {
              dispatch(logout());
              router.push('/');
            }}
          >
            Log out
          </button>
        </header>

        <div className="portal-body">
          {error ? <div className="status-info error">{error}</div> : null}
          {ok ? <div className="status-info">{ok}</div> : null}

          {panel === 'home' ? (
            <div className="portal-grid">
              <section className="portal-card">
                <h2>Ringkasan</h2>
                <ul className="portal-stats">
                  <li>
                    <strong>{courses.length}</strong>
                    <span>Kelas aktif</span>
                  </li>
                  <li>
                    <strong>{grouped.submitted.length}</strong>
                    <span>Tugas menunggu nilai</span>
                  </li>
                  <li>
                    <strong>{orders.filter((o) => o.status === 'awaiting_activation').length}</strong>
                    <span>Pembayaran menunggu aktivasi</span>
                  </li>
                </ul>
              </section>
              <section className="portal-card">
                <h2>Data</h2>
                <div className="portal-data-row">
                  {profile.photoDataUrl ? (
                    <img className="portal-avatar lg" src={profile.photoDataUrl} alt="" />
                  ) : (
                    <div className="portal-avatar lg">{initials(user.name) || 'S'}</div>
                  )}
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <p>ID {user.id}</p>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {panel === 'profile' ? (
            <section className="portal-card portal-form-card">
              <div className="portal-tabs">
                {PROFILE_TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={tab === item.id ? 'active' : ''}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="portal-form-layout">
                <div className="portal-fields">
                  {tab === 'akademik' ? (
                    <>
                      <p className="portal-lock-hint">
                        Program studi, tahun masuk, NIM, nama, kelas, jenis kelamin, status kuliah, dan mulai semester
                        hanya diubah oleh admin.
                      </p>
                      <label className="portal-field">
                        <span>Program Studi:</span>
                        <select value={profile.programStudi} disabled>
                          <option value="">-Pilih-</option>
                          <option value="programming">Pemrograman</option>
                          <option value="design">Desain</option>
                          <option value="business">Bisnis</option>
                          <option value="language">Bahasa</option>
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>Tahun Masuk :</span>
                        <select value={profile.tahunMasuk} disabled>
                          <option value="">-Pilih-</option>
                          {YEAR_OPTIONS.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>NIM:</span>
                        <input value={profile.nim} readOnly />
                      </label>
                      <label className="portal-field">
                        <span>Nama:</span>
                        <input value={user.name} readOnly />
                      </label>
                      <label className="portal-field">
                        <span>Kelas:</span>
                        <select value={profile.kelas} disabled>
                          <option value="">-Pilih Kelas-</option>
                          {courses.map((course) => (
                            <option key={course.id} value={String(course.id)}>
                              {course.title}
                            </option>
                          ))}
                          {profile.kelas && !courses.some((c) => String(c.id) === profile.kelas) ? (
                            <option value={profile.kelas}>{profile.kelas}</option>
                          ) : null}
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>Jenis Kelamin:</span>
                        <select value={profile.gender} disabled>
                          <option value="">-Pilih-</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>Tempat Lahir:</span>
                        <input
                          value={profile.birthPlace}
                          onChange={(e) => patchProfile({ birthPlace: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>Tanggal Lahir:</span>
                        <input
                          type="date"
                          value={profile.birthDate}
                          onChange={(e) => patchProfile({ birthDate: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>Status Kuliah Mhs. :</span>
                        <select value={profile.statusKuliah} disabled>
                          <option value="">-Pilih-</option>
                          <option value="aktif">Aktif</option>
                          <option value="cuti">Cuti</option>
                          <option value="lulus">Lulus</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>Mulai Semester:</span>
                        <select value={profile.mulaiSemester} disabled>
                          <option value="">-Pilih-</option>
                          {SEMESTER_OPTIONS.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : null}
                  {tab === 'pribadi' ? (
                    <>
                      <label className="portal-field">
                        <span>Jenis Kelamin:</span>
                        <select value={profile.gender} disabled>
                          <option value="">-Pilih-</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </label>
                      <label className="portal-field">
                        <span>Tempat Lahir:</span>
                        <input
                          value={profile.birthPlace}
                          onChange={(e) => patchProfile({ birthPlace: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>Tanggal Lahir:</span>
                        <input
                          type="date"
                          value={profile.birthDate}
                          onChange={(e) => patchProfile({ birthDate: e.target.value })}
                        />
                      </label>
                    </>
                  ) : null}
                  {tab === 'wali' ? (
                    <>
                      <label className="portal-field">
                        <span>Nama Wali:</span>
                        <input
                          value={profile.parentName}
                          onChange={(e) => patchProfile({ parentName: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>Hubungan:</span>
                        <input
                          value={profile.parentRelation}
                          onChange={(e) => patchProfile({ parentRelation: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>No. HP:</span>
                        <input
                          value={profile.parentPhone}
                          onChange={(e) => patchProfile({ parentPhone: e.target.value })}
                        />
                      </label>
                    </>
                  ) : null}
                  {tab === 'pendidikan' ? (
                    <>
                      <label className="portal-field">
                        <span>Sekolah Asal:</span>
                        <input
                          value={profile.lastSchool}
                          onChange={(e) => patchProfile({ lastSchool: e.target.value })}
                        />
                      </label>
                      <label className="portal-field">
                        <span>Tahun Lulus:</span>
                        <input
                          value={profile.lastYear}
                          onChange={(e) => patchProfile({ lastYear: e.target.value })}
                        />
                      </label>
                    </>
                  ) : null}
                  {tab === 'akun' ? (
                    <>
                      <label className="portal-field">
                        <span>Email:</span>
                        <input value={user.email} readOnly />
                      </label>
                      <label className="portal-field">
                        <span>Peran:</span>
                        <input value="Mahasiswa" readOnly />
                      </label>
                    </>
                  ) : null}
                  {tab === 'prestasi' ? (
                    <label className="portal-field portal-field-top">
                      <span>Prestasi:</span>
                      <textarea
                        rows={6}
                        value={profile.achievement}
                        onChange={(e) => patchProfile({ achievement: e.target.value })}
                      />
                    </label>
                  ) : null}
                </div>
                <aside className="portal-photo">
                  <span>Foto:</span>
                  {profile.photoDataUrl ? (
                    <img src={profile.photoDataUrl} alt="Foto profil" />
                  ) : (
                    <div className="portal-photo-ph">{initials(user.name) || 'S'}</div>
                  )}
                  <label className="portal-photo-btn">
                    Ganti Foto
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                </aside>
              </div>
              {tab === 'akademik' || tab === 'pribadi' || tab === 'wali' || tab === 'pendidikan' || tab === 'prestasi' ? (
                <div className="portal-form-actions">
                  <button
                    type="button"
                    className="portal-btn-save"
                    onClick={() => {
                      void saveStudentFields();
                    }}
                  >
                    Simpan
                  </button>
                  <button type="button" className="portal-btn-back" onClick={() => openPanel('home')}>
                    Kembali
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {panel === 'password' ? (
            <section className="portal-card portal-form-card">
              <form className="portal-fields" onSubmit={onPassword}>
                <label className="portal-field">
                  <span>Password lama:</span>
                  <input name="currentPassword" type="password" required />
                </label>
                <label className="portal-field">
                  <span>Password baru:</span>
                  <input name="password" type="password" required minLength={6} />
                </label>
                <div className="portal-field">
                  <span />
                  <button type="submit" className="btn btn-primary" disabled={pwBusy}>
                    {pwBusy ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {panel === 'files' ? (
            <section className="portal-card">
              {files.length === 0 ? (
                <p className="dash-empty">Belum ada berkas tugas untuk diunduh.</p>
              ) : (
                files.map(({ task, file }) => (
                  <article className="task-item" key={task.id}>
                    <h4>{task.title}</h4>
                    <p>{file.originalName}</p>
                    <a className="btn btn-outline" href={file.url} target="_blank" rel="noreferrer">
                      Unduh
                    </a>
                  </article>
                ))
              )}
            </section>
          ) : null}

          {panel === 'logins' ? (
            <section className="portal-card">
              {logs.length === 0 ? (
                <p className="dash-empty">Belum ada riwayat di perangkat ini.</p>
              ) : (
                logs.map((item) => (
                  <article className="task-item" key={item.at}>
                    <h4>{formatWhen(item.at)}</h4>
                    <p className="dash-muted">{item.ua}</p>
                  </article>
                ))
              )}
            </section>
          ) : null}

          {panel === 'register' ? (
            <section className="portal-card">
              <p>
                Kelas aktif: <strong>{courses.length}</strong>
              </p>
              <p className="dash-muted">Enroll kelas gratis atau bayar lewat katalog dan keranjang.</p>
              <div className="portal-chips">
                <Link className="btn btn-primary" href="/courses">
                  Buka katalog
                </Link>
              </div>
            </section>
          ) : null}

          {panel === 'courses' ? (
            <section className="portal-card">
              {courses.length === 0 ? (
                <p className="dash-empty">Belum ada kelas aktif. Buka katalog untuk enroll atau bayar.</p>
              ) : (
                <div className="courses-grid">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      actions={
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            setCourseId(course.id);
                            setEditing(null);
                            setModalOpen(true);
                          }}
                        >
                          Kirim tugas
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {panel === 'tasks' ? (
            <section className="portal-card">
              {assignments.length === 0 ? <p className="dash-empty">Belum ada tugas.</p> : null}
              {(['graded', 'submitted', 'pending'] as const).map((status) => (
                <div key={status} className="tasks-list dash-task-group">
                  <h3>{TASK_LABEL[status]}</h3>
                  {grouped[status].length === 0 ? <p className="dash-muted">Tidak ada di sini.</p> : null}
                  {grouped[status].map((task) => (
                    <article className="task-item" key={task.id}>
                      <h4>{task.title}</h4>
                      <p>{task.courseTitle || 'Course'}</p>
                      <span className={`task-status ${task.status}`}>{TASK_LABEL[status]}</span>
                      <FilePreview file={task.attachment} />
                      {task.status === 'graded' ? (
                        <p>
                          Nilai: {task.score} — {task.feedback || 'Tidak ada masukan'}
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setEditing(task);
                            setCourseId(task.courseId);
                            setModalOpen(true);
                          }}
                        >
                          Perbarui
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              ))}
            </section>
          ) : null}

          {panel === 'payments' ? (
            <section className="portal-card">
              {orders.length === 0 ? <p className="dash-empty">Belum ada pembayaran.</p> : null}
              {orders.map((order) => (
                <article className="task-item" key={order.id}>
                  <h4>
                    #{order.id} — {order.items.map((item) => item.title).join(', ')}
                  </h4>
                  <PaymentHistoryLine order={order} />
                  <span className={`task-status ${order.status === 'activated' ? 'graded' : 'submitted'}`}>
                    {order.status === 'awaiting_activation'
                      ? 'Menunggu aktivasi dosen'
                      : order.status === 'activated'
                        ? 'Sudah diaktifkan'
                        : 'Ditolak'}
                  </span>
                </article>
              ))}
            </section>
          ) : null}

          {panel === 'progress' ? (
            <section className="portal-card">
              {courses.length === 0 ? (
                <p className="dash-empty">Nilai muncul setelah ada kelas aktif.</p>
              ) : (
                <div className="progress-section">
                  {courses.map((course) => {
                    const related = assignments.filter((a) => a.courseId === course.id);
                    const graded = related.filter((a) => a.status === 'graded').length;
                    const total = related.length;
                    const pct = total ? Math.round((graded / total) * 100) : 0;
                    return (
                      <div className="progress-card" key={course.id}>
                        <h4>{course.title}</h4>
                        <p>{total ? `${graded} dari ${total} tugas sudah dinilai` : 'Belum ada tugas dikirim'}</p>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {panel === 'survey' ? (
            <section className="portal-card">
              <p className="dash-empty">Belum ada survei aktif.</p>
            </section>
          ) : null}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Perbarui tugas' : 'Kirim tugas'}>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Judul tugas</label>
            <input name="title" required defaultValue={editing?.title || ''} />
          </div>
          <div className="form-group">
            <label>Teks (opsional jika ada file)</label>
            <textarea name="content" rows={5} defaultValue={editing?.content || ''} />
          </div>
          <div className="form-group">
            <label>File / video (mp4, webm, pdf, gambar, Word, ZIP — maks 500 MB)</label>
            <input name="file" type="file" accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.zip" />
          </div>
          {editing?.attachment ? <FilePreview file={editing.attachment} /> : null}
          <button type="submit" className="btn btn-primary">
            {editing ? 'Simpan' : 'Kirim'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
