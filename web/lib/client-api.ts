import type { Assignment, Course, CourseData, Order, PaymentSettings, PublicUser, UserRole } from './types';

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (data as { message?: string }).message ||
      ((data as { errors?: { message: string }[] }).errors || []).map((e) => e.message).join(', ') ||
      'Request failed';
    throw new Error(message);
  }
  return data as T;
}

function authHeaders(json = true): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) throw new Error('No authentication token found. Please login again.');
  return json
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { Authorization: `Bearer ${token}` };
}

export async function registerUser(name: string, email: string, password: string, role: UserRole) {
  const data = await parseResponse<{ user: PublicUser; token: string }>(
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    }),
  );
  return data;
}

export async function loginUser(email: string, password: string, role: UserRole) {
  return parseResponse<{ user: PublicUser; token: string }>(
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    }),
  );
}

export async function resetPassword(email: string) {
  return parseResponse<{ message: string }>(
    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
  );
}

export async function getAllCourses() {
  const data = await parseResponse<{ courses: Course[] }>(await fetch('/api/courses'));
  return data.courses;
}

export async function createCourse(courseData: CourseData) {
  const data = await parseResponse<{ course: Course }>(
    await fetch('/api/courses', { method: 'POST', headers: authHeaders(), body: JSON.stringify(courseData) }),
  );
  return data.course;
}

export async function updateCourse(courseId: number, courseData: Partial<CourseData>) {
  const data = await parseResponse<{ course: Course }>(
    await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(courseData),
    }),
  );
  return data.course;
}

export async function deleteCourse(courseId: number) {
  await parseResponse<{ message: string }>(
    await fetch(`/api/courses/${courseId}`, { method: 'DELETE', headers: authHeaders() }),
  );
}

export async function enrollInCourse(courseId: number) {
  await parseResponse<{ message: string }>(
    await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST', headers: authHeaders() }),
  );
}

export async function getStudentCourses(studentId: number) {
  const data = await parseResponse<{ courses: Course[] }>(
    await fetch(`/api/students/${studentId}/courses`, { headers: authHeaders() }),
  );
  return data.courses;
}

export async function getStudentAssignments(studentId: number) {
  const data = await parseResponse<{ assignments: Assignment[] }>(
    await fetch(`/api/students/${studentId}/assignments`, { headers: authHeaders() }),
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
    await fetch('/api/assignments', { method: 'POST', headers: authHeaders(false), body: form }),
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
    await fetch(`/api/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: authHeaders(false),
      body: form,
    }),
  );
  return data.assignment;
}

export async function getAllAssignments() {
  const data = await parseResponse<{ assignments: Assignment[] }>(
    await fetch('/api/assignments', { headers: authHeaders() }),
  );
  return data.assignments;
}

export async function gradeAssignment(assignmentId: number, score: number, feedback?: string) {
  const data = await parseResponse<{ assignment: Assignment }>(
    await fetch(`/api/assignments/${assignmentId}/grade`, {
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
    await fetch('/api/orders', { method: 'POST', headers: authHeaders(false), body: form }),
  );
  return data;
}

export async function getOrders() {
  const data = await parseResponse<{ orders: Order[] }>(
    await fetch('/api/orders', { headers: authHeaders() }),
  );
  return data.orders;
}

export async function reviewOrder(orderId: number, action: 'activate' | 'reject') {
  const data = await parseResponse<{ order: Order; message: string }>(
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ action }),
    }),
  );
  return data;
}

export async function getPaymentInfo() {
  const data = await parseResponse<{ payment: PaymentSettings }>(await fetch('/api/payment-info'));
  return data.payment;
}

export async function savePaymentInfo(payment: PaymentSettings) {
  const data = await parseResponse<{ payment: PaymentSettings; message: string }>(
    await fetch('/api/payment-info', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payment),
    }),
  );
  return data;
}
