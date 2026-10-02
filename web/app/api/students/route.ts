import { json, isResponse, requireUser } from '@/lib/http';
import { withStoreRead } from '@/lib/storage';
import { mergeStudentProfile } from '@/lib/student-profile';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const students = await withStoreRead((store) =>
    store.users
      .filter((user) => user.role === 'student')
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profile: mergeStudentProfile(user.id, user.profile),
      })),
  );
  return json({ students });
}
