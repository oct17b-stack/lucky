import type { MetadataRoute } from 'next';
import { LOCALES, LOCALE_META } from '@lucky/content';
import { THAI_BIRTH_DAYS } from '@lucky/core';
import { PUBLIC_PATHS, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...PUBLIC_PATHS, ...THAI_BIRTH_DAYS.map((d) => `/lucky-color/${d.key}`)];
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].hreflang, `${SITE_URL}/${l}${path}`])),
      },
    })),
  );
}
