import type { Course } from '@/lib/types';
import { isPaidCourse } from '@/lib/types';
import { formatRupiah } from '@/lib/format';

export default function CourseCard({
  course,
  actions,
}: {
  course: Course;
  actions?: React.ReactNode;
}) {
  const paid = isPaidCourse(course);
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <span className="category">{course.category}</span>
      {paid ? <span className="price-badge">{formatRupiah(course.price || 0)}</span> : <span className="price-badge free">Gratis</span>}
      <p className="description">{course.description}</p>
      <div className="meta">
        <span>{course.duration} hours</span>
      </div>
      {actions ? <div className="course-actions">{actions}</div> : null}
    </article>
  );
}
