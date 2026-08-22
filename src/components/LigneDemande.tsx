'use client';
import { useState, useTransition } from 'react';
import Confirmation from '@/components/Confirmation';
import { changerStatutDemande, supprimerDemande } from '@/app/actions';
import type { Demande } from '@/lib/types';

const LIBELLES: Record<string, string> = {
  stand: 'Stand', scene: 'Scène', benevole: 'Bénévolat', autre: 'Autre',
};

export default function LigneDemande({ demande }: { demande: Demande }) {
  const [pending, start] = useTransition();
  const [confirme, setConfirme] = useState(false);
  const d = demande;

  return (
    <tr style={{ opacity: pending ? .5 : 1 }}>
      <td>
        <strong>{d.nom}</strong><br />
        <a href={`mailto:${d.email}`} style={{ color: '#6b6560', fontSize: '.82rem' }}>{d.email}</a>
        {d.telephone && <><br /><span style={{ color: '#6b6560', fontSize: '.82rem' }}>{d.telephone}</span></>}
      </td>
      <td>{LIBELLES[d.type] ?? d.type}</td>
      <td style={{ maxWidth: 320, fontSize: '.85rem' }}>{d.message}</td>
      <td style={{ whiteSpace: 'nowrap' }}>
        {new Date(d.created_at).toLocaleDateString('fr-FR')}
      </td>
      <td>
        <select
          defaultValue={d.statut}
          onChange={(e) => start(() => { changerStatutDemande(d.id, e.target.value); })}
          style={{ padding: '.35rem', border: '2px solid var(--noir)', fontFamily: 'inherit' }}
        >
          <option value="nouveau">Nouveau</option>
          <option value="traite">Traité</option>
          <option value="refuse">Refusé</option>
        </select>
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn btn-w btn-sm" onClick={() => setConfirme(true)}>
          Suppr.
        </button>
        <Confirmation
          ouvert={confirme}
          danger
          titre="Supprimer cette demande ?"
          message={`Le message de ${d.nom} sera définitivement effacé.`}
          detail="Pensez à noter ses coordonnées ailleurs si vous comptez le recontacter."
          libelleConfirmer="Supprimer"
          onAnnuler={() => setConfirme(false)}
          onConfirmer={() => { setConfirme(false); start(() => { supprimerDemande(d.id); }); }}
        />
      </td>
    </tr>
  );
}
