import { json, isResponse, requireUser } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;
  const studentId = Number((await ctx.params).id);
  if (Number.isNaN(studentId)) return json({ message: 'Invalid student ID' }, 400);
  if (auth.id !== studentId && auth.role !== 'admin') return json({ message: 'Access denied' }, 403);

  return withStoreRead((store) => {
    const assignments = store.assignments
      .filter((a) => a.studentId === studentId)
      .map((assignment) => {
        const course = store.courses.find((c) => c.id === assignment.courseId);
        return { ...assignment, courseTitle: course ? course.title : 'Unknown Course' };
      });
    return json({ assignments });
  });
}
