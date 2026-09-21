'use client';

import type { FileAttachment } from '@/lib/types';
import { authMediaUrl, isAudio, isImage, isVideo } from '@/lib/format';

export default function FilePreview({ file }: { file?: FileAttachment }) {
  if (!file) return null;
  const src = authMediaUrl(file.url);
  return (
    <div className="file-preview">
      {isVideo(file.mimeType) ? (
        <video controls src={src} style={{ width: '100%', maxHeight: 320, borderRadius: 8 }} />
      ) : isAudio(file.mimeType) ? (
        <audio controls src={src} style={{ width: '100%' }} />
      ) : isImage(file.mimeType) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={file.originalName} style={{ maxWidth: '100%', borderRadius: 8 }} />
      ) : (
        <a className="btn btn-outline" href={src} target="_blank" rel="noreferrer">
          Unduh {file.originalName}
        </a>
      )}
      <p className="file-name">{file.originalName}</p>
    </div>
  );
}
