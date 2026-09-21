import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { isCategory, sanitizeText } from '@/lib/validate';
import type { CourseCategory } from '@/lib/types';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);
  return withStoreRead((store) => {
    const course = store.courses.find((c) => c.id === courseId);
    if (!course) return json({ message: 'Course not found' }, 404);
    return json({ course });
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      duration?: number;
      price?: number;
    };
    return withStore(async (store) => {
      const index = store.courses.findIndex((c) => c.id === courseId);
      if (index === -1) return json({ message: 'Course not found' }, 404);
      const title = body.title ? sanitizeText(body.title) : undefined;
      const description = body.description ? sanitizeText(body.description) : undefined;
      const category = body.category && isCategory(body.category) ? (body.category as CourseCategory) : undefined;
      const duration = body.duration !== undefined ? Number(body.duration) : undefined;
      const price = body.price !== undefined ? Number(body.price) : undefined;
      store.courses[index] = {
        ...store.courses[index],
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(category ? { category } : {}),
        ...(duration && Number.isFinite(duration) ? { duration } : {}),
        ...(price !== undefined && Number.isFinite(price) ? { price: Math.max(0, price) } : {}),
      };
      return json({ message: 'Course updated successfully', course: store.courses[index] });
    });
  } catch {
    return json({ message: 'Failed to update course' }, 500);
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const courseId = Number((await ctx.params).id);
  if (Number.isNaN(courseId)) return json({ message: 'Invalid course ID' }, 400);

  return withStore(async (store) => {
    const index = store.courses.findIndex((c) => c.id === courseId);
    if (index === -1) return json({ message: 'Course not found' }, 404);
    store.courses.splice(index, 1);
    store.enrollments = store.enrollments.filter((e) => e.courseId !== courseId);
    store.assignments = store.assignments.filter((a) => a.courseId !== courseId);
    return json({ message: 'Course deleted successfully' });
  });
}
