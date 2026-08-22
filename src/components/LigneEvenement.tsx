'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { basculerPublication, supprimerEvenement } from '@/app/actions';
import Confirmation from '@/components/Confirmation';
import type { Evenement } from '@/lib/types';

export default function LigneEvenement(
  { evenement, dateLisible }: { evenement: Evenement; dateLisible: string }
) {
  const [pending, start] = useTransition();
  const [confirme, setConfirme] = useState(false);

  return (
    <>
      <tr style={{ opacity: pending ? .5 : 1 }}>
        <td>
          <span style={{
            display: 'block', width: 22, height: 22,
            background: evenement.couleur, border: '2px solid var(--noir)',
          }} />
        </td>
        <td>
          <strong>{evenement.titre}</strong><br />
          <span style={{ color: '#6b6560', fontSize: '.8rem' }}>/{evenement.slug}</span>
        </td>
        <td>{dateLisible}</td>
        <td>{evenement.lieu}</td>
        <td>
          <button
            className={`pill ${evenement.publie ? 'on' : 'off'}`}
            style={{ cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => start(() => { basculerPublication(evenement.id, !evenement.publie); })}
          >
            {evenement.publie ? 'Publié' : 'Brouillon'}
          </button>
        </td>
        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <Link className="btn btn-y btn-sm" href={`/admin/evenements/${evenement.id}`}>
            Modifier
          </Link>{' '}
          <button className="btn btn-w btn-sm" onClick={() => setConfirme(true)}>
            Suppr.
          </button>
        </td>
      </tr>

      <Confirmation
        ouvert={confirme}
        danger
        titre="Supprimer cet événement ?"
        message={`« ${evenement.titre} » sera définitivement retiré du site.`}
        detail="Le programme, les infos pratiques et la FAQ associés seront également supprimés. Les demandes reçues sont conservées."
        libelleConfirmer="Supprimer"
        onAnnuler={() => setConfirme(false)}
        onConfirmer={() => {
          setConfirme(false);
          start(() => { supprimerEvenement(evenement.id); });
        }}
      />
    </>
  );
}
