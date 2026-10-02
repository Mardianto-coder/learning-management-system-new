export type ProfileTab = 'akademik' | 'pribadi' | 'wali' | 'pendidikan' | 'akun' | 'prestasi';

export interface StudentProfile {
  programStudi: string;
  tahunMasuk: string;
  nim: string;
  kelas: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  lastSchool: string;
  lastYear: string;
  achievement: string;
  photoDataUrl: string;
  statusKuliah: string;
  mulaiSemester: string;
}

/** @deprecated use StudentProfile */
export type LocalStudentProfile = StudentProfile;

export type AdminProfilePatch = Pick<
  StudentProfile,
  'programStudi' | 'tahunMasuk' | 'nim' | 'kelas' | 'gender' | 'statusKuliah' | 'mulaiSemester'
> & { name?: string };

export type StudentProfilePatch = Pick<
  StudentProfile,
  | 'birthPlace'
  | 'birthDate'
  | 'parentName'
  | 'parentRelation'
  | 'parentPhone'
  | 'lastSchool'
  | 'lastYear'
  | 'achievement'
  | 'photoDataUrl'
>;

export interface LoginLogEntry {
  at: string;
  ua: string;
}

const YEAR_NOW = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => String(YEAR_NOW + 1 - i));
export const SEMESTER_OPTIONS = YEAR_OPTIONS.flatMap((year) => [`${year}1`, `${year}2`]);

const ADMIN_KEYS: (keyof StudentProfile)[] = [
  'programStudi',
  'tahunMasuk',
  'nim',
  'kelas',
  'gender',
  'statusKuliah',
  'mulaiSemester',
];

const STUDENT_KEYS: (keyof StudentProfile)[] = [
  'birthPlace',
  'birthDate',
  'parentName',
  'parentRelation',
  'parentPhone',
  'lastSchool',
  'lastYear',
  'achievement',
  'photoDataUrl',
];

function logKey(userId: number) {
  return `lms-login-log-${userId}`;
}

export function emptyStudentProfile(userId: number): StudentProfile {
  return {
    programStudi: '',
    tahunMasuk: '',
    nim: String(userId),
    kelas: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
    parentName: '',
    parentRelation: '',
    parentPhone: '',
    lastSchool: '',
    lastYear: '',
    achievement: '',
    photoDataUrl: '',
    statusKuliah: '',
    mulaiSemester: '',
  };
}

export function mergeStudentProfile(userId: number, stored?: Partial<StudentProfile> | null): StudentProfile {
  return { ...emptyStudentProfile(userId), ...(stored || {}) };
}

export function pickAdminProfile(input: Record<string, unknown>): Partial<StudentProfile> {
  const out: Partial<StudentProfile> = {};
  for (const key of ADMIN_KEYS) {
    if (key in input) out[key] = String(input[key] ?? '');
  }
  return out;
}

export function pickStudentProfile(input: Record<string, unknown>): Partial<StudentProfile> {
  const out: Partial<StudentProfile> = {};
  for (const key of STUDENT_KEYS) {
    if (key in input) out[key] = String(input[key] ?? '');
  }
  return out;
}

export function loadLoginLog(userId: number): LoginLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(logKey(userId));
    return raw ? (JSON.parse(raw) as LoginLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordLoginLog(userId: number) {
  if (typeof window === 'undefined') return;
  const list = loadLoginLog(userId);
  const at = new Date().toISOString();
  const minute = at.slice(0, 16);
  if (list[0]?.at.slice(0, 16) === minute) return;
  const next = [{ at, ua: navigator.userAgent }, ...list].slice(0, 20);
  localStorage.setItem(logKey(userId), JSON.stringify(next));
}
