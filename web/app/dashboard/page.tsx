'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import Modal from '@/components/Modal';
import FilePreview from '@/components/FilePreview';
import PaymentHistoryLine from '@/components/PaymentHistoryLine';
import {
  getOrders,
  getStudentAssignments,
  getStudentCourses,
  submitAssignment,
  updateAssignment,
} from '@/lib/client-api';
import { useAppSelector } from '@/store/hooks';
import type { Assignment, Course, Order } from '@/lib/types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, ready } = useAppSelector((s) => s.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [courseId, setCourseId] = useState<number | ''>('');

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
    Promise.all([getStudentCourses(user.id), getStudentAssignments(user.id), getOrders()])
      .then(([c, a, o]) => {
        setCourses(c);
        setAssignments(a);
        setOrders(o);
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get('title'));
    const content = String(form.get('content'));
    const uploaded = form.get('file');
    const file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
    try {
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

  if (!ready || !user || user.role !== 'student') return <main className="page">Loading...</main>;

  return (
    <main className="page">
      <div className="container">
        <h1>My Dashboard</h1>
        {error ? <div className="status-info error">{error}</div> : null}

        <section className="dashboard-section">
          <h2>Enrolled Courses</h2>
          <div className="courses-grid">
            {courses.length === 0 ? (
              <p>Belum ada kelas aktif. Enroll kelas gratis atau bayar kelas berbayar lalu tunggu aktivasi dosen.</p>
            ) : null}
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
                    Submit assignment
                  </button>
                }
              />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>My Tasks</h2>
          {(['graded', 'submitted', 'pending'] as const).map((status) => (
            <div key={status} className="tasks-list" style={{ marginBottom: '1rem' }}>
              <h3 style={{ textTransform: 'capitalize' }}>{status}</h3>
              {grouped[status].length === 0 ? <p>Tidak ada tugas {status}.</p> : null}
              {grouped[status].map((task) => (
                <article className="task-item" key={task.id}>
                  <h4>{task.title}</h4>
                  <p>{task.courseTitle || 'Course'}</p>
                  <span className={`task-status ${task.status}`}>{task.status}</span>
                  <FilePreview file={task.attachment} />
                  {task.status === 'graded' ? (
                    <p>
                      Score: {task.score} — {task.feedback || 'No feedback'}
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
                      Update
                    </button>
                  )}
                </article>
              ))}
            </div>
          ))}
        </section>

        <section className="dashboard-section">
          <h2>Pembayaran kelas</h2>
          {orders.length === 0 ? <p>Belum ada pembayaran.</p> : null}
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

        <section className="dashboard-section">
          <h2>Learning Progress</h2>
          <div className="progress-section">
            {courses.map((course) => {
              const related = assignments.filter((a) => a.courseId === course.id);
              const graded = related.filter((a) => a.status === 'graded').length;
              const total = related.length;
              const pct = total ? Math.round((graded / total) * 100) : 0;
              return (
                <div className="progress-card" key={course.id}>
                  <h4>{course.title}</h4>
                  <p>{total ? `${graded}/${total} graded` : 'No assignments submitted yet'}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Update Assignment' : 'Submit Assignment'}
      >
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Assignment Title</label>
            <input name="title" required defaultValue={editing?.title || ''} />
          </div>
          <div className="form-group">
            <label>Submission (teks)</label>
            <textarea name="content" rows={6} defaultValue={editing?.content || ''} />
          </div>
          <div className="form-group">
            <label>File / video (mp4, webm, pdf, gambar, Word, ZIP — max 80MB)</label>
            <input name="file" type="file" accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.zip" />
          </div>
          {editing?.attachment ? <FilePreview file={editing.attachment} /> : null}
          <button type="submit" className="btn btn-primary">
            {editing ? 'Update' : 'Submit'}
          </button>
        </form>
      </Modal>
    </main>
  );
}
