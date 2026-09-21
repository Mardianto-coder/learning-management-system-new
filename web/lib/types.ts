export type UserRole = 'student' | 'admin';
export type CourseCategory = 'programming' | 'design' | 'business' | 'language';
export type AssignmentStatus = 'pending' | 'submitted' | 'graded';
export type EnrollmentStatus = 'active' | 'pending_payment';
export type OrderStatus = 'awaiting_activation' | 'activated' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  authId?: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: CourseCategory;
  duration: number;
  price?: number;
  createdAt?: string;
}

export interface Enrollment {
  studentId: number;
  courseId: number;
  enrolledAt: string;
  status?: EnrollmentStatus;
}

export interface FileAttachment {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Assignment {
  id: number;
  studentId: number;
  courseId: number;
  title: string;
  content: string;
  status: AssignmentStatus;
  submittedAt: string;
  attachment?: FileAttachment;
  courseTitle?: string;
  studentName?: string;
  studentEmail?: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: number;
}

export interface OrderItem {
  courseId: number;
  title: string;
  price: number;
}

export interface Order {
  id: number;
  studentId: number;
  items: OrderItem[];
  total: number;
  note: string;
  senderBank: string;
  proof?: FileAttachment;
  status: OrderStatus;
  createdAt: string;
  activatedAt?: string;
  activatedBy?: number;
  studentName?: string;
  studentEmail?: string;
}

export interface BankAccount {
  id: number;
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentSettings {
  instruction: string;
  accounts: BankAccount[];
}

export interface CourseData {
  title: string;
  description: string;
  category: CourseCategory;
  duration: number;
  price?: number;
}

export interface AssignmentData {
  courseId: number;
  title: string;
  content: string;
}

export function coursePrice(course: Pick<Course, 'price'>): number {
  return Number(course.price) > 0 ? Number(course.price) : 0;
}

export function isPaidCourse(course: Pick<Course, 'price'>): boolean {
  return coursePrice(course) > 0;
}

export function isActiveEnrollment(enrollment: Enrollment): boolean {
  return !enrollment.status || enrollment.status === 'active';
}
