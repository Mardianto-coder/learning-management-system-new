import type { Assignment, Course, Enrollment, Order, PaymentSettings, User } from './types';
import { getSupabaseAdmin } from './supabase';
import type { Counters, Store } from './storage';

function nextAfter(ids: number[]): number {
  return (ids.reduce((max, id) => Math.max(max, id), 0) || 0) + 1;
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function loadStoreFromSupabase(): Promise<Store> {
  const db = getSupabaseAdmin();
  const [profiles, courses, enrollments, assignments, orders, settings, banks] = await Promise.all([
    db.from('profiles').select('*'),
    db.from('courses').select('*'),
    db.from('enrollments').select('*'),
    db.from('assignments').select('*'),
    db.from('orders').select('*'),
    db.from('payment_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('bank_accounts').select('*').order('id'),
  ]);

  throwIfError(profiles.error, 'Load profiles');
  throwIfError(courses.error, 'Load courses');
  throwIfError(enrollments.error, 'Load enrollments');
  throwIfError(assignments.error, 'Load assignments');
  throwIfError(orders.error, 'Load orders');
  throwIfError(settings.error, 'Load payment settings');
  throwIfError(banks.error, 'Load bank accounts');

  const users: User[] = (profiles.data || []).map((row) => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    authId: row.auth_id || undefined,
  }));

  const mappedCourses: Course[] = (courses.data || []).map((row) => ({
    id: Number(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    duration: Number(row.duration),
    price: Number(row.price) || 0,
    createdAt: row.created_at,
  }));

  const mappedEnrollments: Enrollment[] = (enrollments.data || []).map((row) => ({
    studentId: Number(row.student_id),
    courseId: Number(row.course_id),
    enrolledAt: row.enrolled_at,
    status: row.status,
  }));

  const mappedAssignments: Assignment[] = (assignments.data || []).map((row) => ({
    id: Number(row.id),
    studentId: Number(row.student_id),
    courseId: Number(row.course_id),
    title: row.title,
    content: row.content || '',
    status: row.status,
    submittedAt: row.submitted_at,
    attachment: row.attachment || undefined,
    score: row.score ?? undefined,
    feedback: row.feedback || undefined,
    gradedAt: row.graded_at || undefined,
    gradedBy: row.graded_by ?? undefined,
  }));

  const mappedOrders: Order[] = (orders.data || []).map((row) => ({
    id: Number(row.id),
    studentId: Number(row.student_id),
    items: row.items || [],
    total: Number(row.total),
    note: row.note || '',
    senderBank: row.sender_bank || '',
    proof: row.proof || undefined,
    status: row.status,
    createdAt: row.created_at,
    activatedAt: row.activated_at || undefined,
    activatedBy: row.activated_by ?? undefined,
  }));

  const payment: PaymentSettings = {
    instruction:
      settings.data?.instruction ||
      'Transfer sesuai total pembayaran ke salah satu rekening berikut. Lalu unggah bukti transfer agar dosen/admin bisa mengaktifkan kelas.',
    accounts: (banks.data || []).map((row) => ({
      id: Number(row.id),
      bank: row.bank,
      accountNumber: row.account_number,
      accountName: row.account_name,
    })),
  };

  const counters: Counters = {
    nextUserId: nextAfter(users.map((u) => u.id)),
    nextCourseId: nextAfter(mappedCourses.map((c) => c.id)),
    nextAssignmentId: nextAfter(mappedAssignments.map((a) => a.id)),
    nextOrderId: nextAfter(mappedOrders.map((o) => o.id)),
  };

  return {
    users,
    courses: mappedCourses,
    enrollments: mappedEnrollments,
    assignments: mappedAssignments,
    orders: mappedOrders,
    payment,
    counters,
  };
}

export async function saveStoreToSupabase(store: Store): Promise<void> {
  const db = getSupabaseAdmin();

  const profileRows = store.users.map((user) => ({
    id: user.id,
    auth_id: user.authId || null,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.createdAt || new Date().toISOString(),
  }));
  const { error: profileError } = await db.from('profiles').upsert(profileRows, { onConflict: 'id' });
  throwIfError(profileError, 'Save profiles');

  const { error: courseError } = await db.from('courses').upsert(
    store.courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      price: course.price || 0,
      created_at: course.createdAt || new Date().toISOString(),
    })),
    { onConflict: 'id' },
  );
  throwIfError(courseError, 'Save courses');

  await db.from('enrollments').delete().neq('student_id', -1);
  if (store.enrollments.length) {
    const { error } = await db.from('enrollments').insert(
      store.enrollments.map((item) => ({
        student_id: item.studentId,
        course_id: item.courseId,
        status: item.status || 'active',
        enrolled_at: item.enrolledAt,
      })),
    );
    throwIfError(error, 'Save enrollments');
  }

  const { error: assignmentError } = await db.from('assignments').upsert(
    store.assignments.map((item) => ({
      id: item.id,
      student_id: item.studentId,
      course_id: item.courseId,
      title: item.title,
      content: item.content,
      status: item.status,
      attachment: item.attachment || null,
      score: item.score ?? null,
      feedback: item.feedback || null,
      submitted_at: item.submittedAt,
      graded_at: item.gradedAt || null,
      graded_by: item.gradedBy ?? null,
    })),
    { onConflict: 'id' },
  );
  throwIfError(assignmentError, 'Save assignments');

  const { error: orderError } = await db.from('orders').upsert(
    store.orders.map((item) => ({
      id: item.id,
      student_id: item.studentId,
      items: item.items,
      total: item.total,
      note: item.note,
      sender_bank: item.senderBank || '',
      proof: item.proof || null,
      status: item.status,
      created_at: item.createdAt,
      activated_at: item.activatedAt || null,
      activated_by: item.activatedBy ?? null,
    })),
    { onConflict: 'id' },
  );
  throwIfError(orderError, 'Save orders');

  const { error: settingError } = await db.from('payment_settings').upsert({
    id: 1,
    instruction: store.payment.instruction,
  });
  throwIfError(settingError, 'Save payment settings');

  await db.from('bank_accounts').delete().neq('id', -1);
  if (store.payment.accounts.length) {
    const { error } = await db.from('bank_accounts').insert(
      store.payment.accounts.map((account) => ({
        bank: account.bank,
        account_number: account.accountNumber,
        account_name: account.accountName,
      })),
    );
    throwIfError(error, 'Save bank accounts');
  }
}
