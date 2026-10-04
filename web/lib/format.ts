export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function authMediaUrl(url?: string): string {
  return url || '';
}

export function isVideo(mime?: string): boolean {
  return Boolean(mime?.startsWith('video/'));
}

export function isImage(mime?: string): boolean {
  return Boolean(mime?.startsWith('image/'));
}

export function isAudio(mime?: string): boolean {
  return Boolean(mime?.startsWith('audio/'));
}
