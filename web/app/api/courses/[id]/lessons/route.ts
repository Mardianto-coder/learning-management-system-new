import { json, isResponse, requireUser } from '@/lib/http';
import { getBearerUser } from '@/lib/auth';
import { withStore, withStoreRead } from '@/lib/storage';
import { hasActiveCourseAccess } from '@/lib/access';
import { parseHttpUrl, sanitizeText } from '@/lib/validate';
import type { LessonView } from '@/lib/types';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);
  const user = getBearerUser(request);

  return withStoreRead((store) => {
    const course = store.courses.find((item) => item.id === courseId);
    if (!course) return json({ message: 'Course not found' }, 404);
    const canOpen =
      user?.role === 'admin' ||
      (user?.role === 'student' && hasActiveCourseAccess(store.enrollments, user.id, courseId));
    const completed = new Set(
      (store.lessonProgress || [])
        .filter((item) => user && Number(item.studentId) === Number(user.id))
        .map((item) => item.lessonId),
    );
    const lessons: LessonView[] = (store.lessons || [])
      .filter((item) => item.courseId === courseId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((item) =>
        canOpen
          ? { ...item, locked: false, completed: completed.has(item.id) }
          : { ...item, content: '', videoUrl: undefined, materialUrl: undefined, locked: true, completed: false },
      );
    return json({ lessons, unlocked: Boolean(canOpen) });
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      videoUrl?: string;
      materialUrl?: string;
      sortOrder?: number;
    };
    const title = sanitizeText(body.title);
    const content = sanitizeText(body.content);
    const video = parseHttpUrl(body.videoUrl, 'Tautan video');
    const material = parseHttpUrl(body.materialUrl, 'Tautan materi');
    if (video.error) return json({ message: video.error }, 400);
    if (material.error) return json({ message: material.error }, 400);
    if (title.length < 3 || title.length > 200) {
      return json({ message: 'Judul materi 3–200 karakter' }, 400);
    }
    if (content.length < 10 && !video.url && !material.url) {
      return json({ message: 'Isi teks minimal 10 karakter, atau isi tautan video/materi' }, 400);
    }

    return withStore(async (store) => {
      if (!store.courses.find((item) => item.id === courseId)) return json({ message: 'Course not found' }, 404);
      if (!store.lessons) store.lessons = [];
      if (!store.counters.nextLessonId) store.counters.nextLessonId = 1;
      const lesson = {
        id: store.counters.nextLessonId++,
        courseId,
        title,
        content,
        videoUrl: video.url,
        materialUrl: material.url,
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : store.lessons.filter((item) => item.courseId === courseId).length + 1,
      };
      store.lessons.push(lesson);
      return json({ message: 'Materi ditambahkan', lesson }, 201);
    });
  } catch {
    return json({ message: 'Gagal menambah materi' }, 500);
  }
}
