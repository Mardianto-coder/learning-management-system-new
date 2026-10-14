import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { hasActiveCourseAccess } from '@/lib/access';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;
  const lessonId = Number((await ctx.params).id);
  if (Number.isNaN(lessonId)) return json({ message: 'Invalid lesson ID' }, 400);

  return withStore(async (store) => {
    const lesson = (store.lessons || []).find((item) => item.id === lessonId);
    if (!lesson) return json({ message: 'Materi tidak ditemukan' }, 404);
    if (!hasActiveCourseAccess(store.enrollments, auth.id, lesson.courseId)) {
      return json({ message: 'Enroll atau aktifkan kelas dulu untuk menandai materi' }, 403);
    }
    if (!store.lessonProgress) store.lessonProgress = [];
    const exists = store.lessonProgress.find(
      (item) => Number(item.studentId) === Number(auth.id) && item.lessonId === lessonId,
    );
    if (!exists) {
      store.lessonProgress.push({
        studentId: Number(auth.id),
        lessonId,
        completedAt: new Date().toISOString(),
      });
    }
    return json({ message: 'Materi ditandai selesai' });
  });
}
