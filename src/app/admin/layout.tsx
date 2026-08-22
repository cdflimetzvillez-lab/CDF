import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/server';
import NavAdmin from '@/components/NavAdmin';
import Deconnexion from '@/components/Deconnexion';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireAdmin();

  // La page de login a son propre rendu : elle est exclue via son layout imbriqué.
  if (!user) redirect('/admin/login');
  if (!isAdmin) {
    return (
      <div className="adm-main">
        <div className="panel">
          <h2>Compte non autorisé</h2>
          <p style={{ marginBottom: '1rem' }}>
            Votre compte ({user.email}) n&apos;est pas déclaré comme administrateur.
            Ajoutez-le dans la table <code>admins</code> de Supabase.
          </p>
          <Deconnexion />
        </div>
      </div>
    );
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="brand">Comité des Fêtes<br />Back-office</div>
        <NavAdmin />
        <div className="sep">
          <Link href="/" target="_blank" style={{ fontSize: '.8rem' }}>↗ Voir le site</Link>
          <Deconnexion />
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
