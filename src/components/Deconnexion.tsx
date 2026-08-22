'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Deconnexion() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push('/admin/login');
        router.refresh();
      }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', color: '#c9c2bb',
        fontFamily: 'inherit', fontWeight: 600, fontSize: '.8rem',
        padding: '.7rem .9rem', textAlign: 'left', display: 'block',
      }}
    >
      Se déconnecter
    </button>
  );
}
