import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { FileAttachment } from './types';
import { isSupabaseEnabled, getSupabaseAdmin } from './supabase';

const UPLOAD_ROOT = path.join(process.cwd(), '..', 'data', 'uploads');
const MAX_BYTES = 500 * 1024 * 1024;

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
  folder: 'assignments' | 'payments' | 'avatars',
  file: File,
): Promise<FileAttachment> {
  const mime = resolvedType(file);
  const allowed =
    folder === 'avatars' ? ALLOWED_PAYMENT : folder === 'payments' ? ALLOWED_PAYMENT : ALLOWED_ASSIGNMENT;
  if (!allowed.has(mime) || (folder === 'avatars' && !mime.startsWith('image/'))) {
    throw new Error(
      folder === 'avatars'
        ? 'Foto harus gambar JPG, PNG, atau WEBP (maks 20 MB)'
        : folder === 'payments'
          ? 'Bukti bayar harus gambar (JPG/PNG/WEBP) atau PDF'
          : 'Tipe file tidak didukung. Unggah video, audio, PDF, gambar, Word, atau ZIP',
    );
  }
  const maxBytes = folder === 'avatars' ? 20 * 1024 * 1024 : MAX_BYTES;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(folder === 'avatars' ? 'Ukuran foto maksimal 20 MB' : 'Ukuran file maksimal 500 MB');
  }

  const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extFor(mime, file.name)}`;

  if (isSupabaseEnabled()) {
    const db = getSupabaseAdmin();
    const bucket = folder === 'avatars' ? 'avatars' : folder;
    let uploaded = await db.storage.from(bucket).upload(stored, file, {
      contentType: mime,
      upsert: false,
    });
    if (uploaded.error && folder === 'avatars') {
      uploaded = await db.storage.from('payments').upload(`avatars/${stored}`, file, {
        contentType: mime,
        upsert: false,
      });
      if (!uploaded.error) {
        const { data } = db.storage.from('payments').getPublicUrl(`avatars/${stored}`);
        return {
          url: data.publicUrl,
          originalName: file.name,
          mimeType: mime,
          size: file.size,
        };
      }
    }
    if (uploaded.error) throw new Error(uploaded.error.message);
    const { data } = db.storage.from(bucket).getPublicUrl(stored);
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
  await pipeline(Readable.fromWeb(file.stream() as import('stream/web').ReadableStream), createWriteStream(dest));

  return {
    url: `/api/files/${folder}/${stored}`,
    originalName: file.name,
    mimeType: mime,
    size: file.size,
  };
}

export function resolveUploadPath(folder: string, filename: string): string | null {
  if (folder !== 'assignments' && folder !== 'payments' && folder !== 'avatars') return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  return path.join(UPLOAD_ROOT, folder, filename);
}
