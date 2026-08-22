'use client';
import { useActionState, useState } from 'react';
import { reserver, type EtatResa } from '@/app/reservation-actions';

type Props = {
  evenementId: string;
  prixCentimes: number;
  placesMax: number;
  placesRestantes: number | null;
  cloture: string | null;
};

const euros = (c: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(c / 100);

export default function FormulaireReservation({
  evenementId, prixCentimes, placesMax, placesRestantes, cloture,
}: Props) {
  const [etat, action, pending] = useActionState<EtatResa, FormData>(reserver, null);
  const [places, setPlaces] = useState(1);

  const complet = placesRestantes !== null && placesRestantes <= 0;
  const close = cloture ? new Date(cloture) < new Date() : false;
  const plafond = Math.min(placesMax, placesRestantes ?? placesMax);

  if (complet) {
    return (
      <div className="form-box">
        <h3>Complet</h3>
        <p style={{ fontWeight: 600 }}>
          Toutes les places ont trouvé preneur. Écrivez-nous pour être
          prévenu en cas de désistement.
        </p>
      </div>
    );
  }

  if (close) {
    return (
      <div className="form-box">
        <h3>Réservations closes</h3>
        <p style={{ fontWeight: 600 }}>
          La date limite de réservation est passée. Contactez le comité
          pour savoir s&apos;il reste des possibilités.
        </p>
      </div>
    );
  }

  return (
    <form className="form-box" action={action}>
      <h3>Réserver</h3>
      {etat?.erreur && <div className="msg ko">{etat.erreur}</div>}

      <input type="hidden" name="evenement_id" value={evenementId} />

      <div className="field">
        <label htmlFor="r-nom">Nom et prénom</label>
        <input id="r-nom" name="nom" required placeholder="Marie Dupont" />
      </div>

      <div className="field">
        <label htmlFor="r-email">Email</label>
        <input id="r-email" name="email" type="email" required placeholder="vous@exemple.fr" />
        <small style={{ fontSize: '.72rem', color: '#6b6560' }}>
          Votre billet y sera envoyé.
        </small>
      </div>

      <div className="field">
        <label htmlFor="r-tel">Téléphone</label>
        <input id="r-tel" name="telephone" type="tel" required
          placeholder="06 12 34 56 78" />
        <small style={{ fontSize: '.72rem', color: '#6b6560' }}>
          Pour vous joindre en cas de changement de dernière minute.
        </small>
      </div>

      <div className="field">
        <label htmlFor="r-places">Nombre de places</label>
        <select
          id="r-places" name="places"
          value={places}
          onChange={(e) => setPlaces(Number(e.target.value))}
        >
          {Array.from({ length: Math.max(1, plafond) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="r-comm">Remarque (allergies, table commune…)</label>
        <textarea id="r-comm" name="commentaire" rows={2} />
      </div>

      <div className="resa-total">
        <span>Total</span>
        <b>{euros(prixCentimes * places)}</b>
      </div>

      {placesRestantes !== null && placesRestantes <= 20 && (
        <p className="resa-alerte">
          Plus que {placesRestantes} place{placesRestantes > 1 ? 's' : ''} disponible
          {placesRestantes > 1 ? 's' : ''}.
        </p>
      )}

      <button className="btn btn-k" style={{ width: '100%' }} disabled={pending}>
        {pending ? 'Redirection…' : `Payer ${euros(prixCentimes * places)}`}
      </button>

      <p style={{ fontSize: '.72rem', color: '#6b6560', marginTop: '.9rem', lineHeight: 1.5 }}>
        Paiement sécurisé par SumUp. Vous serez redirigé vers leur page,
        aucune donnée bancaire ne transite par ce site.
      </p>
    </form>
  );
}
