import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client sans cookies, pour les contextes exécutés hors requête HTTP
 * (generateStaticParams, sitemap, scripts de build).
 * Ne voit que les données publiques autorisées par les policies RLS.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
