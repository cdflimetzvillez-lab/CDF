import Link from 'next/link';
import { verifierPaiement } from '@/app/reservation-actions';
import { euros } from '@/lib/sumup';
import { dateLongue } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function RetourPaiement({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <Ecran couleur="var(--noir)" titre="Référence manquante">
        <p>Impossible de retrouver votre réservation.</p>
        <Link className="btn btn-y" href={`/evenements/${slug}`}>Retour à l&apos;événement</Link>
      </Ecran>
    );
  }

  const resa = await verifierPaiement(ref);

  if (!resa) {
    return (
      <Ecran couleur="var(--noir)" titre="Réservation introuvable">
        <p>Cette référence ne correspond à aucune réservation.</p>
        <Link className="btn btn-y" href={`/evenements/${slug}`}>Retour à l&apos;événement</Link>
      </Ecran>
    );
  }

  const evt = (resa as any).evenements;

  if (resa.statut === 'payee') {
    return (
      <Ecran couleur="#9BD44F" titre="C'est réservé !">
        <div className="billet">
          <div className="billet-code">
            <span className="mono">Code billet</span>
            <b>{resa.code_billet}</b>
          </div>
          <dl className="billet-infos">
            <div><dt>Événement</dt><dd>{evt?.titre}</dd></div>
            <div><dt>Date</dt><dd>{evt?.date_debut ? dateLongue(evt.date_debut) : '—'}</dd></div>
            <div><dt>Lieu</dt><dd>{evt?.lieu ?? '—'}</dd></div>
            <div><dt>Places</dt><dd>{resa.places}</dd></div>
            <div><dt>Montant réglé</dt><dd>{euros(resa.montant_centimes)}</dd></div>
            <div><dt>Référence</dt><dd>{resa.reference}</dd></div>
          </dl>
        </div>
        <p style={{ marginTop: '1.4rem' }}>
          Un email de confirmation part vers <strong>{resa.email}</strong>.
          Présentez votre code à l&apos;entrée.
        </p>
        <Link className="btn btn-k" href={`/evenements/${slug}`}>Retour à l&apos;événement</Link>
      </Ecran>
    );
  }

  if (resa.statut === 'en_attente') {
    return (
      <Ecran couleur="var(--jaune)" titre="Paiement en cours">
        <p>
          Votre paiement est en cours de validation. Cette page se met à jour
          automatiquement, ou revenez dans quelques minutes.
        </p>
        <p className="mono" style={{ marginTop: '.8rem' }}>Référence : {resa.reference}</p>
        <Link className="btn btn-k" href={`/evenements/${slug}/reservation?ref=${ref}`}>
          Actualiser
        </Link>
      </Ecran>
    );
  }

  return (
    <Ecran couleur="var(--rose)" titre="Paiement non abouti">
      <p>
        Le paiement n&apos;a pas pu être finalisé. Aucun montant n&apos;a été prélevé.
        Vous pouvez réessayer.
      </p>
      <p className="mono" style={{ marginTop: '.8rem' }}>Référence : {resa.reference}</p>
      <Link className="btn btn-k" href={`/evenements/${slug}#reserver`}>Réessayer</Link>
    </Ecran>
  );
}

function Ecran({
  couleur, titre, children,
}: { couleur: string; titre: string; children: React.ReactNode }) {
  return (
    <div className="ecran-resa" style={{ background: couleur }}>
      <div className="ecran-boite">
        <h1>{titre}</h1>
        {children}
      </div>
    </div>
  );
}
