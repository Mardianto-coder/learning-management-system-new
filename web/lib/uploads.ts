import fs from 'fs/promises';
import path from 'path';
import type { FileAttachment } from './types';
import { isSupabaseEnabled, getSupabaseAdmin } from './supabase';

const UPLOAD_ROOT = path.join(process.cwd(), '..', 'data', 'uploads');
const MAX_BYTES = 80 * 1024 * 1024;

const ALLOWED_ASSIGNMENT = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const ALLOWED_PAYMENT = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const EXT_MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function resolvedType(file: File): string {
  if (file.type && (ALLOWED_ASSIGNMENT.has(file.type) || ALLOWED_PAYMENT.has(file.type))) {
    return file.type;
  }
  return EXT_MIME[path.extname(file.name).toLowerCase()] || file.type || '';
}

function extFor(mime: string, originalName: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'audio/mpeg': '.mp3',
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/zip': '.zip',
  };
  return map[mime] || '.bin';
}

export async function saveUpload(
  folder: 'assignments' | 'payments',
  file: File,
): Promise<FileAttachment> {
  const mime = resolvedType(file);
  const allowed = folder === 'payments' ? ALLOWED_PAYMENT : ALLOWED_ASSIGNMENT;
  if (!allowed.has(mime)) {
    throw new Error(
      folder === 'payments'
        ? 'Bukti bayar harus gambar (JPG/PNG/WEBP) atau PDF'
        : 'Tipe file tidak didukung. Unggah video, audio, PDF, gambar, Word, atau ZIP',
    );
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error('Ukuran file maksimal 80 MB');
  }

  const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extFor(mime, file.name)}`;

  if (isSupabaseEnabled()) {
    const db = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await db.storage.from(folder).upload(stored, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = db.storage.from(folder).getPublicUrl(stored);
    return {
      url: data.publicUrl,
      originalName: file.name,
      mimeType: mime,
      size: file.size,
    };
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  const dest = path.join(dir, stored);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buffer);

  return {
    url: `/api/files/${folder}/${stored}`,
    originalName: file.name,
    mimeType: mime,
    size: file.size,
  };
}

export function resolveUploadPath(folder: string, filename: string): string | null {
  if (folder !== 'assignments' && folder !== 'payments') return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  return path.join(UPLOAD_ROOT, folder, filename);
}
