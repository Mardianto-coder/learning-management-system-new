import { json, isResponse, requireUser } from '@/lib/http';
import { withStore } from '@/lib/storage';
import { isActiveEnrollment } from '@/lib/types';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const auth = requireUser(request, 'admin');
  if (isResponse(auth)) return auth;
  const orderId = Number((await ctx.params).id);
  if (Number.isNaN(orderId)) return json({ message: 'Invalid order ID' }, 400);

  const body = (await request.json().catch(() => ({}))) as { action?: string };
  if (body.action !== 'activate' && body.action !== 'reject') {
    return json({ message: 'Action must be activate or reject' }, 400);
  }

  return withStore(async (store) => {
    const index = store.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return json({ message: 'Order not found' }, 404);
    const order = store.orders[index];
    if (order.status !== 'awaiting_activation') {
      return json({ message: 'Order already processed' }, 400);
    }

    if (body.action === 'reject') {
      store.orders[index] = { ...order, status: 'rejected' };
      return json({ message: 'Pembayaran ditolak', order: store.orders[index] });
    }

    for (const item of order.items) {
      const existing = store.enrollments.find(
        (e) => e.studentId === order.studentId && e.courseId === item.courseId,
      );
      if (existing) {
        existing.status = 'active';
        existing.enrolledAt = new Date().toISOString();
      } else {
        store.enrollments.push({
          studentId: order.studentId,
          courseId: item.courseId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
        });
      }
      const stillPending = store.enrollments.find(
        (e) => e.studentId === order.studentId && e.courseId === item.courseId && !isActiveEnrollment(e),
      );
      if (stillPending) stillPending.status = 'active';
    }

    store.orders[index] = {
      ...order,
      status: 'activated',
      activatedAt: new Date().toISOString(),
      activatedBy: auth.id,
    };
    return json({ message: 'Kelas diaktifkan untuk siswa', order: store.orders[index] });
  });
}
