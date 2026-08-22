'use client';
import { useActionState } from 'react';
import { envoyerDemande, type ActionState } from '@/app/actions';

export default function FormulaireDemande({ evenementId }: { evenementId?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(envoyerDemande, null);

  return (
    <form className="form-box" action={action}>
      <h3>Se manifester</h3>
      {state?.ok && <div className="msg ok">{state.ok}</div>}
      {state?.error && <div className="msg ko">{state.error}</div>}

      {evenementId && <input type="hidden" name="evenement_id" value={evenementId} />}

      <div className="field">
        <label htmlFor="nom">Nom / structure</label>
        <input id="nom" name="nom" required placeholder="Ex. Ferme des Coudrayes" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="vous@exemple.fr" />
      </div>
      <div className="field">
        <label htmlFor="telephone">Téléphone (facultatif)</label>
        <input id="telephone" name="telephone" type="tel" placeholder="06 12 34 56 78" />
      </div>
      <div className="field">
        <label htmlFor="type">Je souhaite</label>
        <select id="type" name="type">
          <option value="stand">Tenir un stand</option>
          <option value="scene">Jouer sur une scène</option>
          <option value="benevole">Aider au montage / démontage</option>
          <option value="autre">Autre proposition</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={3} placeholder="Dites-nous en deux lignes ce que vous proposez." />
      </div>

      <button className="btn btn-k" style={{ width: '100%' }} disabled={pending}>
        {pending ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}
