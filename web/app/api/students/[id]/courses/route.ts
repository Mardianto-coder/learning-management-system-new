import { json, isResponse, requireUser } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';
import type { Course } from '@/lib/types';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;
  const studentId = Number((await ctx.params).id);
  if (Number.isNaN(studentId)) return json({ message: 'Invalid student ID' }, 400);
  if (auth.id !== studentId && auth.role !== 'admin') return json({ message: 'Access denied' }, 403);

  return withStoreRead((store) => {
    const courses = store.enrollments
      .filter((e) => e.studentId === studentId && (!e.status || e.status === 'active'))
      .map((e) => store.courses.find((c) => c.id === e.courseId))
      .filter((c): c is Course => Boolean(c));
    return json({ courses });
  });
}
