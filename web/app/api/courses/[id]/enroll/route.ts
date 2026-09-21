import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);

  return withStore(async (store) => {
    const course = store.courses.find((c) => c.id === courseId);
    if (!course) return json({ message: 'Course not found' }, 404);
    if ((course.price || 0) > 0) {
      return json(
        { message: 'Kelas berbayar. Masukkan ke keranjang, bayar, lalu tunggu admin mengaktifkan.' },
        400,
      );
    }
    const exists = store.enrollments.find((e) => e.studentId === auth.id && e.courseId === courseId);
    if (exists && (!exists.status || exists.status === 'active')) {
      return json({ message: 'Already enrolled in this course' }, 400);
    }
    if (exists) {
      exists.status = 'active';
      exists.enrolledAt = new Date().toISOString();
      return json({ message: 'Enrolled successfully' });
    }
    store.enrollments.push({
      studentId: auth.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
    });
    return json({ message: 'Enrolled successfully' });
  });
}
