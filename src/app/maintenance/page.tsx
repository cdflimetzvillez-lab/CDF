import { createStaticClient } from '@/lib/supabase/static';

export const dynamic = 'force-dynamic';

/** Page affichée au public pendant une coupure. */
export default async function PageMaintenance() {
  const db = createStaticClient();
  const { data } = await db
    .from('site_settings')
    .select('maintenance_titre, maintenance_message, maintenance_retour, logo_url, email_contact, facebook_url')
    .eq('id', 1)
    .single();

  const s = data ?? {
    maintenance_titre: 'On revient très vite',
    maintenance_message: 'Le site est momentanément en travaux.',
    maintenance_retour: null,
    logo_url: null,
    email_contact: 'comitedesfetes.limetzvillez@gmail.com',
    facebook_url: null,
  };

  return (
    <div className="mnt">
      <div className="mnt-rayons" aria-hidden="true" />
      <div className="mnt-grain" aria-hidden="true" />

      <div className="mnt-inner">
        {s.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mnt-logo" src={s.logo_url} alt="Comité des Fêtes de Limetz-Villez" />
        )}

        <div className="mnt-panneau">
          <span className="mnt-etiquette mono">Travaux en cours</span>
          <h1>{s.maintenance_titre}</h1>
          <p>{s.maintenance_message}</p>
          {s.maintenance_retour && (
            <p className="mnt-retour">{s.maintenance_retour}</p>
          )}

          <div className="mnt-liens">
            <a className="btn btn-k" href={`mailto:${s.email_contact}`}>Nous écrire</a>
            {s.facebook_url && (
              <a className="btn btn-w" href={s.facebook_url} target="_blank" rel="noreferrer">
                Suivre sur Facebook
              </a>
            )}
          </div>
        </div>

        <p className="mnt-pied mono">
          Comité des Fêtes de Limetz-Villez · Association loi 1901
        </p>
      </div>
    </div>
  );
}
