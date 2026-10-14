import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { parseHttpUrl, sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const lessonId = Number((await ctx.params).id);
  if (Number.isNaN(lessonId)) return json({ message: 'Invalid lesson ID' }, 400);

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      videoUrl?: string;
      materialUrl?: string;
      sortOrder?: number;
    };
    return withStore(async (store) => {
      const index = (store.lessons || []).findIndex((item) => item.id === lessonId);
      if (index === -1) return json({ message: 'Materi tidak ditemukan' }, 404);
      const title = body.title ? sanitizeText(body.title) : store.lessons[index].title;
      const content = body.content !== undefined ? sanitizeText(body.content) : store.lessons[index].content;
      const video = body.videoUrl !== undefined ? parseHttpUrl(body.videoUrl, 'Tautan video') : { url: store.lessons[index].videoUrl };
      const material =
        body.materialUrl !== undefined ? parseHttpUrl(body.materialUrl, 'Tautan materi') : { url: store.lessons[index].materialUrl };
      if (video.error) return json({ message: video.error }, 400);
      if (material.error) return json({ message: material.error }, 400);
      store.lessons[index] = {
        ...store.lessons[index],
        title,
        content,
        videoUrl: video.url,
        materialUrl: material.url,
        sortOrder:
          body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))
            ? Number(body.sortOrder)
            : store.lessons[index].sortOrder,
      };
      return json({ message: 'Materi disimpan', lesson: store.lessons[index] });
    });
  } catch {
    return json({ message: 'Gagal mengubah materi' }, 500);
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const lessonId = Number((await ctx.params).id);
  if (Number.isNaN(lessonId)) return json({ message: 'Invalid lesson ID' }, 400);

  return withStore(async (store) => {
    const before = store.lessons?.length || 0;
    store.lessons = (store.lessons || []).filter((item) => item.id !== lessonId);
    if (store.lessons.length === before) return json({ message: 'Materi tidak ditemukan' }, 404);
    store.lessonProgress = (store.lessonProgress || []).filter((item) => item.lessonId !== lessonId);
    return json({ message: 'Materi dihapus' });
  });
}
