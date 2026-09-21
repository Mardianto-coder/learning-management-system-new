import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { isCategory, sanitizeText } from '@/lib/validate';
import type { Course, CourseCategory } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const courses = await withStoreRead((store) => store.courses);
  return json({ courses });
}

export async function POST(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      duration?: number;
      price?: number;
    };
    const title = sanitizeText(body.title);
    const description = sanitizeText(body.description);
    const category = body.category as CourseCategory;
    const duration = Number(body.duration);
    const price = Number(body.price) > 0 ? Number(body.price) : 0;

    if (title.length < 3 || title.length > 200) {
      return json({ message: 'Title must be between 3 and 200 characters' }, 400);
    }
    if (description.length < 10 || description.length > 2000) {
      return json({ message: 'Description must be between 10 and 2000 characters' }, 400);
    }
    if (!isCategory(category)) return json({ message: 'Invalid category' }, 400);
    if (!Number.isFinite(duration) || duration <= 0) {
      return json({ message: 'Duration must be a positive number' }, 400);
    }

    return withStore(async (store) => {
      const course: Course = {
        id: store.counters.nextCourseId++,
        title,
        description,
        category,
        duration,
        price,
        createdAt: new Date().toISOString(),
      };
      store.courses.push(course);
      return json({ message: 'Course created successfully', course }, 201);
    });
  } catch {
    return json({ message: 'Failed to create course' }, 500);
  }
}
