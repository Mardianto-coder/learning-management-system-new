import type { Assignment, Course, CourseData, Order, PaymentSettings, PublicUser, UserRole } from './types';
import type { StudentProfile } from './student-profile';

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: unknown = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message =
      (data as { message?: string }).message ||
      ((data as { errors?: { message: string }[] }).errors || []).map((e) => e.message).join(', ') ||
      `Gagal unggah (kode ${response.status}). Coba file lebih kecil dari 500 MB.`;
    throw new Error(message);
  }
  return data as T;
}

function authHeaders(json = true): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, credentials: 'include' });
}

export async function registerUser(name: string, email: string, password: string, role: UserRole) {
  const data = await parseResponse<{ user: PublicUser; token: string }>(
    await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    }),
  );
  return data;
}

export async function loginUser(email: string, password: string, role: UserRole) {
  return parseResponse<{ user: PublicUser; token: string }>(
    await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    }),
  );
}

export async function logoutSession() {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
}

export async function resetPassword(email: string) {
  return parseResponse<{ message: string }>(
    await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  );
}

export async function changePassword(currentPassword: string, password: string) {
  return parseResponse<{ message: string }>(
    await apiFetch('/api/auth/change-password', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, password }),
    }),
  );
}

export async function getAllCourses() {
  const data = await parseResponse<{ courses: Course[] }>(await apiFetch('/api/courses'));
  return data.courses;
}

export async function createCourse(courseData: CourseData) {
  const data = await parseResponse<{ course: Course }>(
    await apiFetch('/api/courses', { method: 'POST', headers: authHeaders(), body: JSON.stringify(courseData) }),
  );
  return data.course;
}

export async function updateCourse(courseId: number, courseData: Partial<CourseData>) {
  const data = await parseResponse<{ course: Course }>(
    await apiFetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(courseData),
    }),
  );
  return data.course;
}

export async function deleteCourse(courseId: number) {
  await parseResponse<{ message: string }>(
    await apiFetch(`/api/courses/${courseId}`, { method: 'DELETE', headers: authHeaders() }),
  );
}

export async function enrollInCourse(courseId: number) {
  await parseResponse<{ message: string }>(
    await apiFetch(`/api/courses/${courseId}/enroll`, { method: 'POST', headers: authHeaders() }),
  );
}

export async function getStudentCourses(studentId: number) {
  const data = await parseResponse<{ courses: Course[] }>(
    await apiFetch(`/api/students/${studentId}/courses`, { headers: authHeaders() }),
  );
  return data.courses;
}

export async function getStudentAssignments(studentId: number) {
  const data = await parseResponse<{ assignments: Assignment[] }>(
    await apiFetch(`/api/students/${studentId}/assignments`, { headers: authHeaders() }),
  );
  return data.assignments;
}

export async function submitAssignment(assignmentData: {
  courseId: number;
  title: string;
  content: string;
  file?: File | null;
}) {
  const form = new FormData();
  form.append('courseId', String(assignmentData.courseId));
  form.append('title', assignmentData.title);
  form.append('content', assignmentData.content);
  if (assignmentData.file) form.append('file', assignmentData.file);
  const data = await parseResponse<{ assignment: Assignment }>(
    await apiFetch('/api/assignments', { method: 'POST', headers: authHeaders(false), body: form }),
  );
  return data.assignment;
}

export async function updateAssignment(
  assignmentId: number,
  assignmentData: { title?: string; content?: string; file?: File | null },
) {
  const form = new FormData();
  if (assignmentData.title) form.append('title', assignmentData.title);
  if (assignmentData.content) form.append('content', assignmentData.content);
  if (assignmentData.file) form.append('file', assignmentData.file);
  const data = await parseResponse<{ assignment: Assignment }>(
    await apiFetch(`/api/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: authHeaders(false),
      body: form,
    }),
  );
  return data.assignment;
}

export async function getAllAssignments() {
  const data = await parseResponse<{ assignments: Assignment[] }>(
    await apiFetch('/api/assignments', { headers: authHeaders() }),
  );
  return data.assignments;
}

export async function gradeAssignment(assignmentId: number, score: number, feedback?: string) {
  const data = await parseResponse<{ assignment: Assignment }>(
    await apiFetch(`/api/assignments/${assignmentId}/grade`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ score, feedback: feedback || '' }),
    }),
  );
  return data.assignment;
}

export async function checkoutOrder(courseIds: number[], note: string, proof?: File | null, senderBank?: string) {
  const form = new FormData();
  form.append('courseIds', JSON.stringify(courseIds));
  form.append('note', note);
  form.append('senderBank', senderBank || '');
  if (proof) form.append('proof', proof);
  const data = await parseResponse<{ order: Order; message: string }>(
    await apiFetch('/api/orders', { method: 'POST', headers: authHeaders(false), body: form }),
  );
  return data;
}

export async function getOrders() {
  const data = await parseResponse<{ orders: Order[] }>(
    await apiFetch('/api/orders', { headers: authHeaders() }),
  );
  return data.orders;
}

export async function reviewOrder(orderId: number, action: 'activate' | 'reject') {
  const data = await parseResponse<{ order: Order; message: string }>(
    await apiFetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ action }),
    }),
  );
  return data;
}

export async function getPaymentInfo() {
  const data = await parseResponse<{ payment: PaymentSettings }>(await apiFetch('/api/payment-info'));
  return data.payment;
}

export async function savePaymentInfo(payment: PaymentSettings) {
  const data = await parseResponse<{ payment: PaymentSettings; message: string }>(
    await apiFetch('/api/payment-info', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payment),
    }),
  );
  return data;
}

export async function getMyProfile() {
  const data = await parseResponse<{ name: string; email: string; profile: StudentProfile }>(
    await apiFetch('/api/profile', { headers: authHeaders() }),
  );
  return data;
}

export async function updateMyProfile(patch: Partial<StudentProfile>, photo?: File | null) {
  if (photo) {
    const form = new FormData();
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'photoDataUrl') return;
      if (value !== undefined && value !== null) form.append(key, String(value));
    });
    form.append('photo', photo);
    return parseResponse<{ message: string; name: string; email: string; profile: StudentProfile }>(
      await apiFetch('/api/profile', { method: 'PUT', headers: authHeaders(false), body: form }),
    );
  }
  return parseResponse<{ message: string; name: string; email: string; profile: StudentProfile }>(
    await apiFetch('/api/profile', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    }),
  );
}

export async function getStudents() {
  const data = await parseResponse<{
    students: { id: number; name: string; email: string; profile: StudentProfile }[];
  }>(await apiFetch('/api/students', { headers: authHeaders() }));
  return data.students;
}

export async function updateStudentAcademic(
  studentId: number,
  payload: Partial<StudentProfile> & { name?: string },
) {
  return parseResponse<{
    message: string;
    student: { id: number; name: string; email: string; profile: StudentProfile };
  }>(
    await apiFetch(`/api/students/${studentId}/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),
  );
}
