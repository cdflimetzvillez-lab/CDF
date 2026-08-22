'use client';
import { useActionState, useState } from 'react';
import { majReglages, type ActionState } from '@/app/actions';
import type { SiteSettings } from '@/lib/types';

export default function FormReglages({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(majReglages, null);
  const [couleur, setCouleur] = useState(settings.hero_couleur);
  const s = settings;

  return (
    <form action={action}>
      {state?.ok && <div className="msg ok">{state.ok}</div>}
      {state?.error && <div className="msg ko">{state.error}</div>}

      <div className="panel">
        <h2>Bandeau d&apos;accueil</h2>
        <div className="field">
          <label htmlFor="hero_kicker">Petite étiquette au-dessus du titre</label>
          <input id="hero_kicker" name="hero_kicker" defaultValue={s.hero_kicker} />
        </div>
        <div className="row3">
          <div className="field">
            <label htmlFor="hero_titre_1">Titre — début</label>
            <input id="hero_titre_1" name="hero_titre_1" defaultValue={s.hero_titre_1} />
          </div>
          <div className="field">
            <label htmlFor="hero_titre_accent">Titre — mot en jaune</label>
            <input id="hero_titre_accent" name="hero_titre_accent" defaultValue={s.hero_titre_accent} />
          </div>
          <div className="field">
            <label htmlFor="hero_titre_2">Titre — deuxième ligne (cyan)</label>
            <input id="hero_titre_2" name="hero_titre_2" defaultValue={s.hero_titre_2} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="hero_texte">Texte d&apos;introduction</label>
          <textarea id="hero_texte" name="hero_texte" rows={3} defaultValue={s.hero_texte} />
        </div>
        <div className="row2">
          <div className="field">
            <label htmlFor="hero_couleur">Couleur de fond</label>
            <input id="hero_couleur" name="hero_couleur" type="color" value={couleur}
              onChange={(e) => setCouleur(e.target.value)} style={{ height: 46, padding: 4 }} />
          </div>
          <div className="field">
            <label htmlFor="logo_url">URL du logo (PNG transparent)</label>
            <input id="logo_url" name="logo_url" defaultValue={s.logo_url ?? ''}
              placeholder="https://xxx.supabase.co/storage/v1/object/public/medias/logo.png" />
          </div>
        </div>
        {s.logo_url && (
          <div style={{ background: couleur, padding: '1.5rem', border: '2px solid var(--noir)',
            display: 'flex', justifyContent: 'center' }}>
            <div className="logo-badge" style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logo_url} alt="Aperçu du logo" style={{ width: 160, display: 'block' }} />
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Section association</h2>
        <div className="field">
          <label htmlFor="asso_titre">Titre</label>
          <input id="asso_titre" name="asso_titre" defaultValue={s.asso_titre} />
        </div>
        <div className="field">
          <label htmlFor="asso_texte">Texte (une ligne vide sépare deux paragraphes)</label>
          <textarea id="asso_texte" name="asso_texte" rows={7} defaultValue={s.asso_texte} />
        </div>
      </div>

      <div className="panel">
        <h2>Appel aux bénévoles</h2>
        <div className="field">
          <label htmlFor="benevoles_titre">Titre</label>
          <input id="benevoles_titre" name="benevoles_titre" defaultValue={s.benevoles_titre} />
        </div>
        <div className="field">
          <label htmlFor="benevoles_texte">Texte</label>
          <textarea id="benevoles_texte" name="benevoles_texte" rows={3} defaultValue={s.benevoles_texte} />
        </div>
      </div>

      <div className="panel">
        <h2>Coordonnées</h2>
        <div className="row3">
          <div className="field">
            <label htmlFor="email_contact">Email de contact</label>
            <input id="email_contact" name="email_contact" type="email" defaultValue={s.email_contact} />
          </div>
          <div className="field">
            <label htmlFor="adresse">Adresse</label>
            <input id="adresse" name="adresse" defaultValue={s.adresse} />
          </div>
          <div className="field">
            <label htmlFor="facebook_url">Page Facebook</label>
            <input id="facebook_url" name="facebook_url" defaultValue={s.facebook_url ?? ''} />
          </div>
        </div>
      </div>

      <button className="btn btn-k" disabled={pending} style={{ marginBottom: '3rem' }}>
        {pending ? 'Enregistrement…' : 'Enregistrer les réglages'}
      </button>
    </form>
  );
}
