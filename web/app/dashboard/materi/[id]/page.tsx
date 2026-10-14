'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { completeLesson, getCourse, getCourseLessons } from '@/lib/client-api';
import { useAppSelector } from '@/store/hooks';
import type { Course, LessonView } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

export default function CourseMateriPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const { user, ready } = useAppSelector((s) => s.auth);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonView[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
    if (!Number.isFinite(courseId)) {
      setError('Kelas tidak valid');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [lessonData, course] = await Promise.all([getCourseLessons(courseId), getCourse(courseId)]);
        if (cancelled) return;
        setLessons(lessonData.lessons);
        setUnlocked(lessonData.unlocked);
        setCourse(course);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat materi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, router, courseId]);

  if (!ready || !user || user.role !== 'student') {
    return <main className="page">Loading...</main>;
  }

  return (
    <div className="portal materi-page">
      <div className="portal-main">
        <header className="portal-bar">
          <Link className="portal-logout" href="/dashboard">
            ← Kelas saya
          </Link>
          <h1>{course?.title || 'Materi kelas'}</h1>
          <ThemeToggle className="theme-toggle-portal" />
        </header>
        <div className="portal-body">
          {error ? <div className="status-info error">{error}</div> : null}
          {loading ? <p className="dash-muted">Memuat materi...</p> : null}
          {!loading && !unlocked ? (
            <section className="portal-card">
              <p>Materi terkunci. Enroll kelas gratis atau tunggu aktivasi pembayaran, lalu buka lagi.</p>
              <div className="portal-chips">
                <Link className="btn btn-primary" href="/courses">
                  Buka katalog
                </Link>
              </div>
            </section>
          ) : null}
          {!loading && unlocked && lessons.length === 0 ? (
            <section className="portal-card">
              <p className="dash-empty">Admin belum menambahkan pertemuan untuk kelas ini.</p>
            </section>
          ) : null}
          {!loading && unlocked
            ? lessons.map((item) => (
                <article className="portal-card materi-card" key={item.id}>
                  <h2>{item.title}</h2>
                  {item.completed ? <span className="task-status graded">Selesai</span> : null}
                  {item.videoUrl || item.materialUrl ? (
                    <p className="materi-links">
                      {item.videoUrl ? (
                        <a className="btn btn-primary" href={item.videoUrl} target="_blank" rel="noreferrer">
                          Buka video
                        </a>
                      ) : null}
                      {item.materialUrl ? (
                        <a className="btn btn-outline" href={item.materialUrl} target="_blank" rel="noreferrer">
                          Buka materi
                        </a>
                      ) : null}
                    </p>
                  ) : null}
                  {item.content ? <div className="materi-body">{item.content}</div> : null}
                  {!item.completed ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={async () => {
                        try {
                          await completeLesson(item.id);
                          const data = await getCourseLessons(courseId);
                          setLessons(data.lessons);
                          setUnlocked(data.unlocked);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Gagal menandai selesai');
                        }
                      }}
                    >
                      Tandai selesai
                    </button>
                  ) : null}
                </article>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
