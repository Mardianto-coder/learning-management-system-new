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
  gradeAssignment,
  reviewOrder,
  savePaymentInfo,
  updateCourse,
} from '@/lib/client-api';
import { formatRupiah } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';
import type { Assignment, BankAccount, Course, CourseCategory, Order, PaymentSettings } from '@/lib/types';

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

  async function reload() {
    const [c, a, o, p] = await Promise.all([getAllCourses(), getAllAssignments(), getOrders(), getPaymentInfo()]);
    setCourses(c);
    setAssignments(a);
    setOrders(o);
    setPayment(p);
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
      await gradeAssignment(grading.id, Number(form.get('score')), String(form.get('feedback') || ''));
      setGrading(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade');
    }
  }

  if (!ready || !user || user.role !== 'admin') return <main className="page">Loading...</main>;

  return (
    <main className="page">
      <div className="container">
        <h1>Admin Dashboard</h1>
        {error ? <div className="status-info error">{error}</div> : null}

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Course Management</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditing(null);
                setCourseModal(true);
              }}
            >
              + Add New Course
            </button>
          </div>
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
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={async () => {
                        if (!confirm('Delete this course?')) return;
                        await deleteCourse(course.id);
                        await reload();
                      }}
                    >
                      Delete
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Assignment Grading</h2>
          <div className="tasks-list">
            {assignments.length === 0 ? <p>Tidak ada assignment.</p> : null}
            {assignments.map((item) => (
              <article className="task-item" key={item.id}>
                <h4>{item.title}</h4>
                <p>
                  {item.studentName} — {item.courseTitle}
                </p>
                <span className={`task-status ${item.status}`}>{item.status}</span>
                {item.status === 'submitted' ? (
                  <button type="button" className="btn btn-primary" onClick={() => setGrading(item)}>
                    Grade
                  </button>
                ) : item.status === 'graded' ? (
                  <p>Score: {item.score}</p>
                ) : null}
                <FilePreview file={item.attachment} />
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Rekening tujuan pembayaran</h2>
          <p>Siswa akan melihat rekening ini di halaman keranjang sebelum transfer.</p>
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

        <section className="dashboard-section">
          <h2>Aktivasi kelas berbayar</h2>
          {orders.length === 0 ? <p>Belum ada pembayaran siswa.</p> : null}
          {orders.map((order) => (
            <article className="task-item" key={order.id}>
              <h4>
                #{order.id} — {order.studentName} ({order.studentEmail})
              </h4>
              <p>{order.items.map((item) => `${item.title} (${formatRupiah(item.price)})`).join(', ')}</p>
              <p>Total: {formatRupiah(order.total)}</p>
              <PaymentHistoryLine order={order} />
              {order.note ? <p>Catatan: {order.note}</p> : null}
              <span className={`task-status ${order.status === 'activated' ? 'graded' : order.status === 'rejected' ? 'pending' : 'submitted'}`}>
                {order.status}
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
      </div>

      <Modal
        open={courseModal}
        onClose={() => setCourseModal(false)}
        title={editing ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={onSaveCourse}>
          <div className="form-group">
            <label>Course Title</label>
            <input name="title" required defaultValue={editing?.title || ''} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={4} required defaultValue={editing?.description || ''} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" defaultValue={editing?.category || 'programming'}>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="language">Language</option>
            </select>
          </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input name="duration" type="number" required defaultValue={editing?.duration || 10} />
            </div>
            <div className="form-group">
              <label>Harga (Rp) — isi 0 untuk kelas gratis</label>
              <input name="price" type="number" min={0} defaultValue={editing?.price || 0} />
            </div>
          <button type="submit" className="btn btn-primary">
            Save Course
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(grading)} onClose={() => setGrading(null)} title="Grade Assignment">
        {grading ? (
          <form onSubmit={onGrade}>
            <p>
              <strong>Student:</strong> {grading.studentName}
            </p>
            <p>
              <strong>Course:</strong> {grading.courseTitle}
            </p>
            <p>
              <strong>Title:</strong> {grading.title}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', margin: '1rem 0' }}>{grading.content}</p>
            <FilePreview file={grading.attachment} />
            <div className="form-group">
              <label>Score (0-100)</label>
              <input name="score" type="number" min={0} max={100} required />
            </div>
            <div className="form-group">
              <label>Feedback (Optional)</label>
              <textarea name="feedback" rows={4} />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Grade
            </button>
          </form>
        ) : null}
      </Modal>
    </main>
  );
}
