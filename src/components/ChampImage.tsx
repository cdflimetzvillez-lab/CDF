'use client';
import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  name: string;
  label: string;
  aide?: string;
  valeurInitiale?: string | null;
  dossier?: string;
};

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function ChampImage({
  name, label, aide, valeurInitiale, dossier = 'evenements',
}: Props) {
  const [url, setUrl] = useState(valeurInitiale ?? '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [survol, setSurvol] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function envoyer(fichier: File) {
    setErreur('');

    if (!TYPES.includes(fichier.type)) {
      setErreur('Formats acceptés : JPG, PNG, WebP ou AVIF.');
      return;
    }
    if (fichier.size > TAILLE_MAX) {
      setErreur(`Fichier trop lourd (${(fichier.size / 1024 / 1024).toFixed(1)} Mo). Maximum 5 Mo.`);
      return;
    }

    setEnvoi(true);
    try {
      const supabase = createClient();
      const ext = fichier.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const nom = `${dossier}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from('medias')
        .upload(nom, fichier, { cacheControl: '31536000', upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from('medias').getPublicUrl(nom);
      setUrl(data.publicUrl);
    } catch (e: any) {
      console.error('[upload]', e);
      setErreur(
        e?.message?.includes('row-level security')
          ? "Envoi refusé : vérifiez les droits du bucket « medias »."
          : "L'envoi a échoué. Réessayez."
      );
    } finally {
      setEnvoi(false);
    }
  }

  function deposer(e: React.DragEvent) {
    e.preventDefault();
    setSurvol(false);
    const f = e.dataTransfer.files?.[0];
    if (f) envoyer(f);
  }

  return (
    <div className="field">
      <label htmlFor={`${name}-file`}>{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="img-apercu">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Aperçu" />
          <div className="img-actions">
            <button type="button" className="btn btn-w btn-sm"
              onClick={() => inputRef.current?.click()}>
              Remplacer
            </button>
            <button type="button" className="btn btn-w btn-sm"
              onClick={() => setUrl('')}>
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`img-zone${survol ? ' survol' : ''}${envoi ? ' envoi' : ''}`}
          onClick={() => !envoi && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
          onDragLeave={() => setSurvol(false)}
          onDrop={deposer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          {envoi ? (
            <span>Envoi en cours…</span>
          ) : (
            <>
              <strong>Choisir une image</strong>
              <span>ou glissez-la ici · JPG, PNG, WebP · 5 Mo max</span>
            </>
          )}
        </div>
      )}

      <input
        id={`${name}-file`}
        ref={inputRef}
        type="file"
        accept={TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) envoyer(f);
          e.target.value = '';
        }}
      />

      {erreur && <div className="msg ko" style={{ marginTop: '.6rem' }}>{erreur}</div>}
      {aide && !erreur && (
        <small style={{ fontSize: '.72rem', color: '#6b6560', display: 'block', marginTop: '.4rem' }}>
          {aide}
        </small>
      )}
    </div>
  );
}
