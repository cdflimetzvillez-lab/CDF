'use client';
import { useTransition } from 'react';
import { changerStatutDemande, supprimerDemande } from '@/app/actions';
import type { Demande } from '@/lib/types';

const LIBELLES: Record<string, string> = {
  stand: 'Stand', scene: 'Scène', benevole: 'Bénévolat', autre: 'Autre',
};

export default function LigneDemande({ demande }: { demande: Demande }) {
  const [pending, start] = useTransition();
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
        <button className="btn btn-w btn-sm"
          onClick={() => {
            if (confirm(`Supprimer la demande de ${d.nom} ?`))
              start(() => { supprimerDemande(d.id); });
          }}>
          Suppr.
        </button>
      </td>
    </tr>
  );
}
