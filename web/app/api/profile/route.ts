import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { mergeStudentProfile, pickStudentProfile } from '@/lib/student-profile';

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
    const body = (await request.json()) as Record<string, unknown>;
    const patch = pickStudentProfile(body);
    if (patch.photoDataUrl && patch.photoDataUrl.length > 1_200_000) {
      return json({ message: 'Foto terlalu besar. Pakai gambar lebih kecil.' }, 400);
    }
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
  } catch {
    return json({ message: 'Gagal menyimpan profil' }, 500);
  }
}
