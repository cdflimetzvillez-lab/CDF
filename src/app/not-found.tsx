import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--rose)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem', gap: '1.5rem',
    }}>
      <h1 style={{ fontSize: 'clamp(3rem,14vw,9rem)', color: 'var(--creme)',
        textShadow: '6px 6px 0 var(--noir)', lineHeight: .85 }}>
        Page<br />introuvable
      </h1>
      <p style={{ fontWeight: 600, maxWidth: '40ch' }}>
        Cette page n&apos;existe pas ou l&apos;événement n&apos;est plus en ligne.
      </p>
      <Link className="btn btn-y" href="/">Retour à l&apos;accueil</Link>
    </div>
  );
}
