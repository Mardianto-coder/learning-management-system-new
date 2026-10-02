import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { mergeStudentProfile, pickAdminProfile } from '@/lib/student-profile';
import { sanitizeText } from '@/lib/validate';

export const runtime = 'nodejs';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const studentId = Number(id);
  if (!studentId) return json({ message: 'Invalid student' }, 400);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const patch = pickAdminProfile(body);
    const name = sanitizeText(body.name);
    return withStore(async (store) => {
      const user = store.users.find((item) => item.id === studentId && item.role === 'student');
      if (!user) return json({ message: 'Student not found' }, 404);
      if (name) user.name = name;
      user.profile = { ...mergeStudentProfile(user.id, user.profile), ...patch };
      return json({
        message: 'Data akademik disimpan',
        student: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        },
      });
    });
  } catch {
    return json({ message: 'Gagal menyimpan data akademik' }, 500);
  }
}
