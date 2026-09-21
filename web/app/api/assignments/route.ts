import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { sanitizeText } from '@/lib/validate';
import { saveUpload } from '@/lib/uploads';
import { isActiveEnrollment } from '@/lib/types';
import type { Assignment } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  return withStoreRead((store) => {
    const assignments = store.assignments.map((assignment) => {
      const course = store.courses.find((c) => c.id === assignment.courseId);
      const student = store.users.find((u) => u.id === assignment.studentId);
      return {
        ...assignment,
        courseTitle: course ? course.title : 'Unknown Course',
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : 'Unknown Email',
      };
    });
    return json({ assignments });
  });
}

async function readAssignmentInput(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    return {
      courseId: Number(form.get('courseId')),
      title: sanitizeText(form.get('title')),
      content: sanitizeText(form.get('content')),
      file: file instanceof File && file.size > 0 ? file : null,
    };
  }
  const body = (await request.json()) as { courseId?: number; title?: string; content?: string };
  return {
    courseId: Number(body.courseId),
    title: sanitizeText(body.title),
    content: sanitizeText(body.content),
    file: null as File | null,
  };
}

export async function POST(request: Request) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;
  try {
    const input = await readAssignmentInput(request);
    if (Number.isNaN(input.courseId)) return json({ message: 'Invalid course ID' }, 400);
    if (input.title.length < 3 || input.title.length > 200) {
      return json({ message: 'Title must be between 3 and 200 characters' }, 400);
    }
    if (!input.file && (input.content.length < 10 || input.content.length > 10000)) {
      return json({ message: 'Isi tugas minimal 10 karakter, atau unggah file/video' }, 400);
    }

    const attachment = input.file ? await saveUpload('assignments', input.file) : undefined;

    return withStore(async (store) => {
      const enrolled = store.enrollments.find(
        (e) => e.studentId === auth.id && e.courseId === input.courseId && isActiveEnrollment(e),
      );
      if (!enrolled) return json({ message: 'You must be enrolled in this course' }, 400);
      const assignment: Assignment = {
        id: store.counters.nextAssignmentId++,
        studentId: auth.id,
        courseId: input.courseId,
        title: input.title,
        content: input.content || (attachment ? `(file) ${attachment.originalName}` : ''),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        attachment,
      };
      store.assignments.push(assignment);
      return json({ message: 'Assignment submitted successfully', assignment }, 201);
    });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Failed to submit assignment' }, 400);
  }
}
