import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { sanitizeText } from '@/lib/validate';
import { saveUpload } from '@/lib/uploads';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;
  const assignmentId = Number((await ctx.params).id);
  if (Number.isNaN(assignmentId)) return json({ message: 'Invalid assignment ID' }, 400);

  return withStoreRead((store) => {
    const assignment = store.assignments.find((a) => a.id === assignmentId);
    if (!assignment) return json({ message: 'Assignment not found' }, 404);
    if (assignment.studentId !== auth.id && auth.role !== 'admin') {
      return json({ message: 'Access denied' }, 403);
    }
    if (auth.role === 'admin') {
      const course = store.courses.find((c) => c.id === assignment.courseId);
      const student = store.users.find((u) => u.id === assignment.studentId);
      return json({
        assignment: {
          ...assignment,
          courseTitle: course ? course.title : 'Unknown Course',
          studentName: student ? student.name : 'Unknown Student',
          studentEmail: student ? student.email : 'Unknown Email',
        },
      });
    }
    return json({ assignment });
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;
  const assignmentId = Number((await ctx.params).id);
  if (Number.isNaN(assignmentId)) return json({ message: 'Invalid assignment ID' }, 400);

  try {
    const contentType = request.headers.get('content-type') || '';
    let title: string | undefined;
    let content: string | undefined;
    let file: File | null = null;
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      title = form.get('title') ? sanitizeText(form.get('title')) : undefined;
      content = form.get('content') ? sanitizeText(form.get('content')) : undefined;
      const uploaded = form.get('file');
      file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
    } else {
      const body = (await request.json()) as { title?: string; content?: string };
      title = body.title ? sanitizeText(body.title) : undefined;
      content = body.content ? sanitizeText(body.content) : undefined;
    }
    const attachment = file ? await saveUpload('assignments', file) : undefined;

    return withStore(async (store) => {
      const index = store.assignments.findIndex((a) => a.id === assignmentId);
      if (index === -1) return json({ message: 'Assignment not found' }, 404);
      const assignment = store.assignments[index];
      if (assignment.studentId !== auth.id) {
        return json({ message: 'You can only update your own assignments' }, 403);
      }
      if (assignment.status === 'graded') {
        return json({ message: 'Cannot update graded assignments' }, 400);
      }
      store.assignments[index] = {
        ...assignment,
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(attachment ? { attachment } : {}),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };
      return json({ message: 'Assignment updated successfully', assignment: store.assignments[index] });
    });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Failed to update assignment' }, 400);
  }
}
