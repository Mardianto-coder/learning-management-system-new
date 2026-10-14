import type { Enrollment, Lesson } from './types';
import { isActiveEnrollment } from './types';

export function hasActiveCourseAccess(
  enrollments: Enrollment[],
  studentId: number,
  courseId: number,
): boolean {
  return enrollments.some(
    (item) =>
      Number(item.studentId) === Number(studentId) &&
      Number(item.courseId) === Number(courseId) &&
      isActiveEnrollment(item),
  );
}

export function courseLessonProgress(
  lessons: Lesson[],
  completedLessonIds: Set<number>,
  courseId: number,
): { total: number; done: number; percent: number } {
  const list = lessons.filter((item) => item.courseId === courseId);
  const done = list.filter((item) => completedLessonIds.has(item.id)).length;
  const total = list.length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
