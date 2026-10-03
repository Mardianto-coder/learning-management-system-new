'use client';

import type { FileAttachment } from '@/lib/types';
import { authMediaUrl, isAudio, isImage, isVideo } from '@/lib/format';

export default function FilePreview({ file }: { file?: FileAttachment }) {
  if (!file) return null;
  const src = authMediaUrl(file.url);
  return (
    <div className="file-preview">
      {isVideo(file.mimeType) ? (
        <video controls preload="metadata" src={src} />
      ) : isAudio(file.mimeType) ? (
        <audio controls src={src} />
      ) : isImage(file.mimeType) ? (
        <a href={src} target="_blank" rel="noreferrer" className="media-link" title="Buka ukuran penuh">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={file.originalName} loading="lazy" decoding="async" />
        </a>
      ) : (
        <a className="btn btn-outline" href={src} target="_blank" rel="noreferrer">
          Unduh {file.originalName}
        </a>
      )}
      <p className="file-name">{file.originalName}</p>
    </div>
  );
}
