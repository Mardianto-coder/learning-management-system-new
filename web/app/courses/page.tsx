'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import { enrollInCourse } from '@/lib/client-api';
import { isPaidCourse } from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { fetchCourses, setCategory, setSearch } from '@/store/slices/coursesSlice';
import type { CourseCategory } from '@/lib/types';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, loading, error, search, category } = useAppSelector((s) => s.courses);
  const user = useAppSelector((s) => s.auth.user);
  const ready = useAppSelector((s) => s.auth.ready);
  const cart = useAppSelector((s) => s.cart.items);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return items.filter((course) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q);
      const matchCat = !category || course.category === category;
      return matchSearch && matchCat;
    });
  }, [items, search, category]);

  async function enroll(id: number) {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'student') {
      setNotice('Hanya student yang bisa enroll.');
      return;
    }
    try {
      await enrollInCourse(id);
      setNotice('Berhasil enroll. Cek Dashboard.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal enroll');
    }
  }

  function addPaid(courseId: number) {
    if (!user) {
      router.push('/login');
      return;
    }
    const course = items.find((c) => c.id === courseId);
    if (!course) return;
    dispatch(addToCart(course));
    setNotice(`${course.title} masuk keranjang.`);
  }

  return (
    <main className="page">
      <div className="container">
        <h1>Available Courses</h1>
        <div className="search-filter">
          <input
            className="search-input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
          <select
            className="filter-select"
            value={category}
            onChange={(e) => dispatch(setCategory(e.target.value as CourseCategory | ''))}
          >
            <option value="">All Categories</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="language">Language</option>
          </select>
        </div>
        {notice ? <div className="status-info info">{notice}</div> : null}
        {error ? <div className="status-info error">{error}</div> : null}
        {loading || !ready ? <p>Loading courses...</p> : null}
        <div className="courses-grid">
          {filtered.map((course) => {
            const paid = isPaidCourse(course);
            const inCart = cart.some((item) => item.courseId === course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                actions={
                  paid ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={inCart}
                      onClick={() => addPaid(course.id)}
                    >
                      {inCart ? 'Di keranjang' : 'Tambah ke keranjang'}
                    </button>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={() => enroll(course.id)}>
                      Enroll
                    </button>
                  )
                }
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
