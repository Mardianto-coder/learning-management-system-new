export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function authMediaUrl(url?: string): string {
  if (!url || typeof window === 'undefined') return url || '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const token = localStorage.getItem('authToken');
  if (!token) return url;
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}token=${encodeURIComponent(token)}`;
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
