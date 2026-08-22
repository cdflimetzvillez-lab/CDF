import { createClient } from '@supabase/supabase-js';

/**
 * Client à privilèges élevés (service role), qui contourne les RLS.
 * Usage strictement serveur : webhooks, création de réservations.
 * Ne jamais l'importer dans un composant client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) throw new Error('Variables Supabase service role manquantes');

  return createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
