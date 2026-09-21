'use client';

export default function Modal({
  open,
  onClose,
  title,
  children,
  large,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal active" role="dialog" onClick={onClose}>
      <div className={`modal-content${large ? ' large' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
