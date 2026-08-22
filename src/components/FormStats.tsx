'use client';
import { useActionState, useState } from 'react';
import { majStats, type ActionState } from '@/app/actions';
import type { Stat } from '@/lib/types';

export default function FormStats({ stats }: { stats: Stat[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(majStats, null);
  const [lignes, setLignes] = useState(
    stats.length ? stats.map((s) => ({ valeur: s.valeur, libelle: s.libelle }))
                 : [{ valeur: '', libelle: '' }]
  );

  return (
    <form action={action}>
      {state?.ok && <div className="msg ok">{state.ok}</div>}
      {state?.error && <div className="msg ko">{state.error}</div>}

      <div className="panel">
        <h2>Chiffres clés</h2>
        <p style={{ color: '#6b6560', fontSize: '.88rem', marginBottom: '1.2rem' }}>
          Affichés à droite du texte de présentation, sur la page d&apos;accueil.
        </p>
        {lignes.map((l, i) => (
          <div className="repeat-item" key={i}>
            <div className="row2">
              <div className="field">
                <label>Valeur</label>
                <input name="stat_valeur" defaultValue={l.valeur} placeholder="60+" />
              </div>
              <div className="field">
                <label>Libellé</label>
                <input name="stat_libelle" defaultValue={l.libelle} placeholder="Bénévoles actifs" />
              </div>
            </div>
            <button type="button" className="btn btn-w btn-sm"
              onClick={() => setLignes(lignes.filter((_, j) => j !== i))}>
              Retirer
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-y btn-sm"
          onClick={() => setLignes([...lignes, { valeur: '', libelle: '' }])}>
          + Ajouter un chiffre
        </button>
      </div>

      <button className="btn btn-k" disabled={pending} style={{ marginBottom: '3rem' }}>
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
