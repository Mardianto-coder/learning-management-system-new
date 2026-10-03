import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { mergeStudentProfile, pickStudentProfile } from '@/lib/student-profile';
import { saveUpload } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;
  const user = await withStoreRead((store) => store.users.find((item) => item.id === auth.id));
  if (!user) return json({ message: 'User not found' }, 404);
  return json({ name: user.name, email: user.email, profile: mergeStudentProfile(user.id, user.profile) });
}

export async function PUT(request: Request) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;
  try {
    const contentType = request.headers.get('content-type') || '';
    let patch: Record<string, unknown> = {};
    let photoUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const raw: Record<string, unknown> = {};
      for (const [key, value] of form.entries()) {
        if (key === 'photo' && value instanceof File && value.size > 0) {
          const saved = await saveUpload('avatars', value);
          photoUrl = saved.url;
        } else if (typeof value === 'string') {
          raw[key] = value;
        }
      }
      patch = pickStudentProfile(raw);
    } else {
      patch = pickStudentProfile((await request.json()) as Record<string, unknown>);
      if (typeof patch.photoDataUrl === 'string' && patch.photoDataUrl.startsWith('data:')) {
        delete patch.photoDataUrl;
      }
    }
    if (photoUrl) patch.photoDataUrl = photoUrl;

    return withStore(async (store) => {
      const user = store.users.find((item) => item.id === auth.id);
      if (!user) return json({ message: 'User not found' }, 404);
      user.profile = { ...mergeStudentProfile(user.id, user.profile), ...patch };
      return json({
        message: 'Profil disimpan',
        name: user.name,
        email: user.email,
        profile: user.profile,
      });
    });
  } catch (err) {
    return json({ message: err instanceof Error ? err.message : 'Gagal menyimpan profil' }, 500);
  }
}
