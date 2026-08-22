'use client';
import { useEffect, useRef } from 'react';

type Props = {
  ouvert: boolean;
  titre: string;
  message: string;
  detail?: string;
  libelleConfirmer?: string;
  danger?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
};

export default function Confirmation({
  ouvert, titre, message, detail,
  libelleConfirmer = 'Confirmer', danger = false,
  onConfirmer, onAnnuler,
}: Props) {
  const annulerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    annulerRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onAnnuler();
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [ouvert, onAnnuler]);

  if (!ouvert) return null;

  return (
    <div className="modal-fond" onClick={onAnnuler}>
      <div
        className="modal-boite"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-titre"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-bandeau${danger ? ' danger' : ''}`} />
        <h2 id="modal-titre">{titre}</h2>
        <p>{message}</p>
        {detail && <p className="modal-detail">{detail}</p>}
        <div className="modal-actions">
          <button ref={annulerRef} className="btn btn-w btn-sm" onClick={onAnnuler}>
            Annuler
          </button>
          <button
            className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-k'}`}
            onClick={onConfirmer}
          >
            {libelleConfirmer}
          </button>
        </div>
      </div>
    </div>
  );
}
