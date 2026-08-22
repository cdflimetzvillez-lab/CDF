import type { MetadataRoute } from 'next';
import { createStaticClient } from '@/lib/supabase/static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comitedesfetes-limetzvillez.fr';
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('evenements')
    .select('slug, updated_at')
    .eq('publie', true);

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...(data ?? []).map((e) => ({
      url: `${base}/evenements/${e.slug}`,
      lastModified: new Date(e.updated_at),
      priority: 0.8,
    })),
  ];
}
