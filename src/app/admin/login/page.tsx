'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Formulaire() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [charge, setCharge] = useState(false);

  async function connexion(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur('');
    const { error } = await createClient().auth.signInWithPassword({
      email, password: motDePasse,
    });
    if (error) { setErreur('Email ou mot de passe incorrect.'); setCharge(false); return; }
    router.push(params.get('next') ?? '/admin');
    router.refresh();
  }

  return (
    <form className="form-box" style={{ width: '100%', maxWidth: 400 }} onSubmit={connexion}>
      <h3>Administration</h3>
      {erreur && <div className="msg ko">{erreur}</div>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="mdp">Mot de passe</label>
        <input id="mdp" type="password" required value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)} autoComplete="current-password" />
      </div>
      <button className="btn btn-k" style={{ width: '100%' }} disabled={charge}>
        {charge ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <div className="login-page">
      <Suspense fallback={null}>
        <Formulaire />
      </Suspense>
    </div>
  );
}
