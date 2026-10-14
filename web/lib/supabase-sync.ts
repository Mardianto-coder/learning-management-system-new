import type { Assignment, Course, Enrollment, Lesson, LessonProgress, Order, PaymentSettings, User } from './types';
import { getSupabaseAdmin } from './supabase';
import type { Counters, Store } from './storage';
import { DEFAULT_LESSONS } from './lessons-seed';
import { dedupeBankAccounts } from './banks';

function nextAfter(ids: number[]): number {
  return (ids.reduce((max, id) => Math.max(max, id), 0) || 0) + 1;
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function loadStoreFromSupabase(): Promise<Store> {
  const db = getSupabaseAdmin();
  const [profiles, courses, enrollments, assignments, orders, settings, banks, lessons, progress] = await Promise.all([
    db.from('profiles').select('*'),
    db.from('courses').select('*'),
    db.from('enrollments').select('*'),
    db.from('assignments').select('*'),
    db.from('orders').select('*'),
    db.from('payment_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('bank_accounts').select('*').order('id'),
    db.from('lessons').select('*').order('sort_order'),
    db.from('lesson_progress').select('*'),
  ]);

  throwIfError(profiles.error, 'Load profiles');
  throwIfError(courses.error, 'Load courses');
  throwIfError(enrollments.error, 'Load enrollments');
  throwIfError(assignments.error, 'Load assignments');
  throwIfError(orders.error, 'Load orders');
  throwIfError(settings.error, 'Load payment settings');
  throwIfError(banks.error, 'Load bank accounts');
  const lessonTableMissing = Boolean(
    lessons.error && /does not exist|schema cache|could not find/i.test(lessons.error.message),
  );
  const progressTableMissing = Boolean(
    progress.error && /does not exist|schema cache|could not find/i.test(progress.error.message),
  );
  if (!lessonTableMissing) throwIfError(lessons.error, 'Load lessons');
  if (!progressTableMissing) throwIfError(progress.error, 'Load lesson progress');
  let mappedLessons: Lesson[] = lessonTableMissing
    ? DEFAULT_LESSONS
    : (lessons.data || []).map((row) => ({
        id: Number(row.id),
        courseId: Number(row.course_id),
        title: row.title,
        content: row.content || '',
        videoUrl: row.video_url || undefined,
        materialUrl: row.material_url || undefined,
        sortOrder: Number(row.sort_order) || 0,
      }));
  if (!lessonTableMissing && mappedLessons.length === 0) {
    const seeded = await db.from('lessons').upsert(
      DEFAULT_LESSONS.map((item) => ({
        id: item.id,
        course_id: item.courseId,
        title: item.title,
        content: item.content,
        video_url: item.videoUrl || null,
        material_url: item.materialUrl || null,
        sort_order: item.sortOrder,
      })),
      { onConflict: 'id' },
    );
    if (!seeded.error) mappedLessons = DEFAULT_LESSONS;
  }
  const mappedProgress: LessonProgress[] = progressTableMissing
    ? []
    : (progress.data || []).map((row) => ({
        studentId: Number(row.student_id),
        lessonId: Number(row.lesson_id),
        completedAt: row.completed_at,
      }));

  const users: User[] = (profiles.data || []).map((row) => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    authId: row.auth_id || undefined,
    profile: row.profile || undefined,
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
    accounts: dedupeBankAccounts(
      (banks.data || []).map((row) => ({
        id: Number(row.id),
        bank: row.bank,
        accountNumber: row.account_number,
        accountName: row.account_name,
      })),
    ),
  };

  const counters: Counters = {
    nextUserId: nextAfter(users.map((u) => u.id)),
    nextCourseId: nextAfter(mappedCourses.map((c) => c.id)),
    nextAssignmentId: nextAfter(mappedAssignments.map((a) => a.id)),
    nextOrderId: nextAfter(mappedOrders.map((o) => o.id)),
    nextLessonId: nextAfter(mappedLessons.map((item) => item.id)),
  };

  return {
    users,
    courses: mappedCourses,
    enrollments: mappedEnrollments,
    assignments: mappedAssignments,
    orders: mappedOrders,
    lessons: mappedLessons,
    lessonProgress: mappedProgress,
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
    profile: user.profile || {},
    created_at: user.createdAt || new Date().toISOString(),
  }));
  let { error: profileError } = await db.from('profiles').upsert(profileRows, { onConflict: 'id' });
  if (profileError && /profiles\.profile|column .*profile/i.test(profileError.message)) {
    const withoutProfile = profileRows.map(({ profile: _profile, ...row }) => row);
    const retry = await db.from('profiles').upsert(withoutProfile, { onConflict: 'id' });
    profileError = retry.error;
  }
  if (profileError && /row-level security|rls/i.test(profileError.message)) {
    profileError = null;
  }
  throwIfError(profileError, 'Save profiles');

  const [courseResult, assignmentResult, orderResult, settingResult] = await Promise.all([
    db.from('courses').upsert(
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
    ),
    db.from('assignments').upsert(
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
    ),
    db.from('orders').upsert(
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
    ),
    db.from('payment_settings').upsert({
      id: 1,
      instruction: store.payment.instruction,
    }),
  ]);
  throwIfError(courseResult.error, 'Save courses');
  throwIfError(assignmentResult.error, 'Save assignments');
  throwIfError(orderResult.error, 'Save orders');
  throwIfError(settingResult.error, 'Save payment settings');

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

  const lessonRows = (store.lessons || []).map((item) => ({
    id: item.id,
    course_id: item.courseId,
    title: item.title,
    content: item.content,
    video_url: item.videoUrl || null,
    material_url: item.materialUrl || null,
    sort_order: item.sortOrder,
  }));
  if (lessonRows.length) {
    const saved = await db.from('lessons').upsert(lessonRows, { onConflict: 'id' });
    if (saved.error && !/does not exist|schema cache|could not find|material_url/i.test(saved.error.message)) {
      throwIfError(saved.error, 'Save lessons');
    }
  }
  const { error: progressDeleteError } = await db.from('lesson_progress').delete().neq('student_id', -1);
  if (progressDeleteError && !/does not exist|schema cache|could not find/i.test(progressDeleteError.message)) {
    throwIfError(progressDeleteError, 'Clear lesson progress');
  } else if (!progressDeleteError && store.lessonProgress?.length) {
    const { error } = await db.from('lesson_progress').insert(
      store.lessonProgress.map((item) => ({
        student_id: item.studentId,
        lesson_id: item.lessonId,
        completed_at: item.completedAt,
      })),
    );
    if (error && !/does not exist|schema cache|could not find/i.test(error.message)) {
      throwIfError(error, 'Save lesson progress');
    }
  }

  const { error: bankDeleteError } = await db.from('bank_accounts').delete().neq('id', -1);
  throwIfError(bankDeleteError, 'Clear bank accounts');
  const uniqueBanks = dedupeBankAccounts(store.payment.accounts);
  if (uniqueBanks.length) {
    const { error } = await db.from('bank_accounts').insert(
      uniqueBanks.map((account) => ({
        bank: account.bank,
        account_number: account.accountNumber,
        account_name: account.accountName,
      })),
    );
    throwIfError(error, 'Save bank accounts');
  }
}
