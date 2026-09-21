import { json, isResponse, requireUser } from '@/lib/http';
import { withStore, withStoreRead } from '@/lib/storage';
import { saveUpload } from '@/lib/uploads';
import { coursePrice, isActiveEnrollment, isPaidCourse } from '@/lib/types';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';

function withNames(store: { users: { id: number; name: string; email: string }[] }, order: Order): Order {
  const student = store.users.find((u) => u.id === order.studentId);
  return {
    ...order,
    studentName: student?.name || 'Unknown Student',
    studentEmail: student?.email || 'Unknown Email',
  };
}

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (isResponse(auth)) return auth;
  return withStoreRead((store) => {
    const list =
      auth.role === 'admin'
        ? store.orders
        : store.orders.filter((order) => order.studentId === auth.id);
    return json({ orders: list.map((order) => withNames(store, order)) });
  });
}

export async function POST(request: Request) {
  const auth = requireUser(request, 'student');
  if (isResponse(auth)) return auth;

  try {
    const form = await request.formData();
    const rawIds = String(form.get('courseIds') || '[]');
    let courseIds: number[] = [];
    try {
      courseIds = (JSON.parse(rawIds) as unknown[]).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    } catch {
      return json({ message: 'Invalid cart data' }, 400);
    }
    const note = String(form.get('note') || '').trim();
    const senderBank = String(form.get('senderBank') || '').trim();
    const proofFile = form.get('proof');

    if (!courseIds.length) return json({ message: 'Keranjang kosong' }, 400);
    if (!senderBank) return json({ message: 'Pilih bank asal pembayaran siswa' }, 400);

    let proof;
    if (proofFile instanceof File && proofFile.size > 0) {
      proof = await saveUpload('payments', proofFile);
    }

    return withStore(async (store) => {
      const items = [];
      for (const courseId of courseIds) {
        const course = store.courses.find((c) => c.id === courseId);
        if (!course) return json({ message: `Course ${courseId} not found` }, 404);
        if (!isPaidCourse(course)) {
          return json({ message: `${course.title} gratis, tidak perlu dibayar` }, 400);
        }
        const enrolled = store.enrollments.find(
          (e) => e.studentId === auth.id && e.courseId === courseId && isActiveEnrollment(e),
        );
        if (enrolled) return json({ message: `Anda sudah aktif di ${course.title}` }, 400);
        const pending = store.orders.find(
          (o) =>
            o.studentId === auth.id &&
            o.status === 'awaiting_activation' &&
            o.items.some((item) => item.courseId === courseId),
        );
        if (pending) {
          return json({ message: `Pembayaran ${course.title} masih menunggu aktivasi admin` }, 400);
        }
        items.push({ courseId, title: course.title, price: coursePrice(course) });
      }

      const order: Order = {
        id: store.counters.nextOrderId++,
        studentId: auth.id,
        items,
        total: items.reduce((sum, item) => sum + item.price, 0),
        note,
        senderBank,
        proof,
        status: 'awaiting_activation',
        createdAt: new Date().toISOString(),
      };
      store.orders.push(order);
      return json(
        {
          message: 'Bukti bayar terkirim. Tunggu admin/dosen mengaktifkan kelas.',
          order: withNames(store, order),
        },
        201,
      );
    });
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : 'Checkout failed' }, 400);
  }
}
