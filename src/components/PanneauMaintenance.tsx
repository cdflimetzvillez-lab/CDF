'use client';
import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  basculerMaintenance, majTextesMaintenance, type EtatMaintenance,
} from '@/app/maintenance-actions';
import Confirmation from '@/components/Confirmation';

type Reglages = {
  maintenance_active: boolean;
  maintenance_titre: string;
  maintenance_message: string;
  maintenance_retour: string | null;
  maintenance_depuis: string | null;
};

export default function PanneauMaintenance({ reglages }: { reglages: Reglages }) {
  const [etat, action, pending] = useActionState<EtatMaintenance, FormData>(
    majTextesMaintenance, null
  );
  const [bascule, start] = useTransition();
  const [confirme, setConfirme] = useState(false);
  const [retour, setRetour] = useState(false);

  const actif = reglages.maintenance_active;

  const depuis = reglages.maintenance_depuis
    ? new Date(reglages.maintenance_depuis).toLocaleString('fr-FR', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <>
      <div className={`mnt-statut${actif ? ' coupe' : ''}`}>
        <div>
          <div className="mnt-statut-titre">
            {actif ? 'Site coupé' : 'Site en ligne'}
          </div>
          <p>
            {actif
              ? <>Les visiteurs voient la page d&apos;attente{depuis && <> depuis le {depuis}</>}.
                  Le back-office reste accessible.</>
              : <>Le site public fonctionne normalement.</>}
          </p>
        </div>

        <button
          className={`btn ${actif ? 'btn-y' : 'btn-danger'}`}
          disabled={bascule}
          onClick={() => {
            if (actif) start(() => { basculerMaintenance(false); });
            else setConfirme(true);
          }}
        >
          {bascule ? '…' : actif ? 'Remettre en ligne' : 'Couper le site'}
        </button>
      </div>

      {actif && (
        <div className="panel" style={{ borderLeft: '10px solid var(--rose)' }}>
          <h2>Vérifier le rendu</h2>
          <p style={{ color: '#6b6560', fontSize: '.9rem', marginBottom: '1rem' }}>
            Ouvrez le site public dans un onglet privé pour voir ce que voient les visiteurs.
          </p>
          <Link className="btn btn-w btn-sm" href="/" target="_blank">
            Ouvrir le site public
          </Link>
        </div>
      )}

      <form action={action}>
        {etat?.ok && <div className="msg ok">{etat.ok}</div>}
        {etat?.erreur && <div className="msg ko">{etat.erreur}</div>}

        <div className="panel">
          <h2>Textes de la page d&apos;attente</h2>

          <div className="field">
            <label htmlFor="maintenance_titre">Titre</label>
            <input id="maintenance_titre" name="maintenance_titre" required
              defaultValue={reglages.maintenance_titre} />
          </div>

          <div className="field">
            <label htmlFor="maintenance_message">Message</label>
            <textarea id="maintenance_message" name="maintenance_message" rows={3}
              defaultValue={reglages.maintenance_message} />
          </div>

          <div className="field">
            <label htmlFor="maintenance_retour">Retour prévu (facultatif)</label>
            <input id="maintenance_retour" name="maintenance_retour"
              defaultValue={reglages.maintenance_retour ?? ''}
              placeholder="De retour vers 18h" />
          </div>

          <button className="btn btn-k" disabled={pending}>
            {pending ? 'Enregistrement…' : 'Enregistrer les textes'}
          </button>
        </div>
      </form>

      <Confirmation
        ouvert={confirme}
        danger
        titre="Couper le site public ?"
        message="Les visiteurs verront la page d'attente à la place du programme et des réservations."
        detail="Les réservations en cours de paiement seront interrompues. Le back-office reste accessible pour vous."
        libelleConfirmer="Couper le site"
        onAnnuler={() => setConfirme(false)}
        onConfirmer={() => {
          setConfirme(false);
          start(() => { basculerMaintenance(true); });
        }}
      />
    </>
  );
}
