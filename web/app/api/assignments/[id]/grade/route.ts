import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const assignmentId = Number((await ctx.params).id);
  if (Number.isNaN(assignmentId)) return json({ message: 'Invalid assignment ID' }, 400);

  try {
    const body = (await request.json()) as { score?: number; feedback?: string };
    const score = Number(body.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return json({ message: 'Score must be between 0 and 100' }, 400);
    }
    const feedback = sanitizeText(body.feedback || '');

    return withStore(async (store) => {
      const index = store.assignments.findIndex((a) => a.id === assignmentId);
      if (index === -1) return json({ message: 'Assignment not found' }, 404);
      const assignment = store.assignments[index];
      if (assignment.status === 'graded') return json({ message: 'Assignment has already been graded' }, 400);
      if (assignment.status !== 'submitted') return json({ message: 'Can only grade submitted assignments' }, 400);
      store.assignments[index] = {
        ...assignment,
        status: 'graded',
        score,
        feedback,
        gradedAt: new Date().toISOString(),
        gradedBy: auth.id,
      };
      const course = store.courses.find((c) => c.id === assignment.courseId);
      const student = store.users.find((u) => u.id === assignment.studentId);
      return json({
        message: 'Assignment graded successfully',
        assignment: {
          ...store.assignments[index],
          courseTitle: course ? course.title : 'Unknown Course',
          studentName: student ? student.name : 'Unknown Student',
          studentEmail: student ? student.email : 'Unknown Email',
        },
      });
    });
  } catch {
    return json({ message: 'Failed to grade assignment' }, 500);
  }
}
