import fs from 'fs/promises';
import path from 'path';
import { isSupabaseEnabled } from './supabase';
import { loadStoreFromSupabase, saveStoreToSupabase } from './supabase-sync';
import type { Assignment, Course, Enrollment, Order, PaymentSettings, User } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PAYMENT_FILE = path.join(DATA_DIR, 'payment-settings.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');

export interface Counters {
  nextUserId: number;
  nextCourseId: number;
  nextAssignmentId: number;
  nextOrderId: number;
}

export interface Store {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  assignments: Assignment[];
  orders: Order[];
  payment: PaymentSettings;
  counters: Counters;
}

const DEFAULT_PAYMENT: PaymentSettings = {
  instruction:
    'Transfer sesuai total pembayaran ke salah satu rekening berikut. Lalu unggah bukti transfer agar dosen/admin bisa mengaktifkan kelas.',
  accounts: [
    { id: 1, bank: 'BCA', accountNumber: '1234567890', accountName: 'LMS Platform' },
    { id: 2, bank: 'Bank Mandiri', accountNumber: '1500012345678', accountName: 'LMS Platform' },
  ],
};

const DEFAULT_COURSES: Course[] = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
    category: 'programming',
    duration: 40,
    price: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'UI/UX Design Principles',
    description: 'Master the art of creating beautiful and user-friendly interfaces.',
    category: 'design',
    duration: 30,
    price: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Business Management Fundamentals',
    description: 'Essential skills for managing teams and projects effectively.',
    category: 'business',
    duration: 35,
    price: 150000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'English for Professionals',
    description: 'Improve your English communication skills for the workplace.',
    category: 'language',
    duration: 50,
    price: 200000,
    createdAt: new Date().toISOString(),
  },
];

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJSONFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

let queue: Promise<unknown> = Promise.resolve();

function lock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function loadStore(): Promise<Store> {
  if (isSupabaseEnabled()) {
    return loadStoreFromSupabase();
  }
  await ensureDataDir();
  const users = await readJSONFile<User[]>(USERS_FILE, []);
  let courses = await readJSONFile<Course[]>(COURSES_FILE, []);
  if (courses.length === 0) {
    try {
      await fs.access(COURSES_FILE);
    } catch {
      courses = DEFAULT_COURSES;
      await writeJSONFile(COURSES_FILE, courses);
    }
  }
  const enrollments = await readJSONFile<Enrollment[]>(ENROLLMENTS_FILE, []);
  const assignments = await readJSONFile<Assignment[]>(ASSIGNMENTS_FILE, []);
  const orders = await readJSONFile<Order[]>(ORDERS_FILE, []);
  let payment = await readJSONFile<PaymentSettings>(PAYMENT_FILE, DEFAULT_PAYMENT);
  if (!payment.accounts?.length) {
    payment = DEFAULT_PAYMENT;
    await writeJSONFile(PAYMENT_FILE, payment);
  }
  const counters = await readJSONFile<Counters>(COUNTERS_FILE, {
    nextUserId: 1,
    nextCourseId: 5,
    nextAssignmentId: 1,
    nextOrderId: 1,
  });
  if (!counters.nextOrderId) counters.nextOrderId = 1;
  return { users, courses, enrollments, assignments, orders, payment, counters };
}

export async function saveStore(store: Store): Promise<void> {
  if (isSupabaseEnabled()) {
    await saveStoreToSupabase(store);
    return;
  }
  await ensureDataDir();
  await Promise.all([
    writeJSONFile(USERS_FILE, store.users),
    writeJSONFile(COURSES_FILE, store.courses),
    writeJSONFile(ENROLLMENTS_FILE, store.enrollments),
    writeJSONFile(ASSIGNMENTS_FILE, store.assignments),
    writeJSONFile(ORDERS_FILE, store.orders),
    writeJSONFile(PAYMENT_FILE, store.payment),
    writeJSONFile(COUNTERS_FILE, store.counters),
  ]);
}

export function withStore<T>(fn: (store: Store) => Promise<T>): Promise<T> {
  return lock(async () => {
    const store = await loadStore();
    const result = await fn(store);
    await saveStore(store);
    return result;
  });
}

export function withStoreRead<T>(fn: (store: Store) => Promise<T> | T): Promise<T> {
  return lock(async () => fn(await loadStore()));
}
