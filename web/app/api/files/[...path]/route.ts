import { readFile } from 'fs/promises';
import { json } from '@/lib/http';
import { getBearerUser } from '@/lib/auth';
import { resolveUploadPath } from '@/lib/uploads';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  const user = getBearerUser(request);
  if (!user) return json({ message: 'Authentication required' }, 401);

  const segments = (await ctx.params).path || [];
  if (segments.length !== 2) return json({ message: 'Invalid file path' }, 400);
  const [folder, filename] = segments;
  const filePath = resolveUploadPath(folder, filename);
  if (!filePath) return json({ message: 'Invalid file path' }, 400);

  try {
    const data = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mp3: 'audio/mpeg',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      zip: 'application/zip',
    };
    const safeName = filename.replace(/["\\\r\n]/g, '_');
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': types[ext || ''] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return json({ message: 'File not found' }, 404);
  }
}
