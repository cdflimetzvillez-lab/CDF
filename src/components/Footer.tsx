import Link from 'next/link';
import type { SiteSettings, Evenement } from '@/lib/types';

export default function Footer({
  settings, evenements,
}: { settings: SiteSettings; evenements: Evenement[] }) {
  return (
    <footer>
      {settings.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="foot-logo" src={settings.logo_url} alt="Comité des Fêtes de Limetz-Villez" />
      ) : (
        <div className="anton" style={{ color: 'var(--creme)', fontSize: '1.3rem', lineHeight: 1.1 }}>
          Comité des Fêtes<br />de Limetz-Villez
        </div>
      )}

      <div style={{ display: 'flex', gap: '3.5rem', flexWrap: 'wrap' }}>
        <div>
          <h4>Programme</h4>
          <ul>
            {evenements.map((e) => (
              <li key={e.id}>
                <Link href={`/evenements/${e.slug}`}>{e.titre}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href={`mailto:${settings.email_contact}`}>{settings.email_contact}</a></li>
            <li>{settings.adresse}</li>
            {settings.facebook_url && (
              <li><a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a></li>
            )}
          </ul>
        </div>
      </div>

      <div className="fb">
        © {new Date().getFullYear()} Comité des Fêtes de Limetz-Villez — Association loi 1901 ·{' '}
        <Link href="/admin">Administration</Link>
      </div>
    </footer>
  );
}
