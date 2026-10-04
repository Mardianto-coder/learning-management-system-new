const VERCEL_SAFE_BYTES = 1.5 * 1024 * 1024;

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
}

export async function compressForUpload(file: File, maxBytes = VERCEL_SAFE_BYTES): Promise<File> {
  if (!isImageFile(file)) {
    if (file.size > maxBytes) {
      throw new Error('File bukan gambar terlalu besar untuk Vercel (maks sekitar 1,5 MB). Kompres PDF atau pilih file lebih kecil.');
    }
    return file;
  }
  if (file.size <= 800 * 1024) return file;
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const maxEdge = 1600;
  if (width > maxEdge || height > maxEdge) {
    const scale = maxEdge / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.82;
  let blob: Blob | null = null;
  for (let i = 0; i < 6; i += 1) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((next) => resolve(next), 'image/jpeg', quality);
    });
    if (!blob || blob.size <= maxBytes) break;
    quality -= 0.12;
  }
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
