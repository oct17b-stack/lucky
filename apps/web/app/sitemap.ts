import type { MetadataRoute } from 'next';
import { LOCALES, LOCALE_META } from '@lucky/content';
import { THAI_BIRTH_DAYS, todayIn } from '@lucky/core';
import { WEEKDAY_SLUGS } from '@/components/DailyColors';
import { addDays, formatYmd } from '@/lib/calendar';
import { PUBLIC_PATHS, SITE_URL } from '@/lib/site';

/** 站点地图每天重新生成，万年历收录“前 7 天到后 90 天” */
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = todayIn('Asia/Bangkok');
  const calendarDays = Array.from({ length: 98 }, (_, i) => `/calendar/${formatYmd(addDays(today, i - 7))}`);
  const paths = [
    ...PUBLIC_PATHS,
    ...THAI_BIRTH_DAYS.map((d) => `/lucky-color/${d.key}`),
    ...THAI_BIRTH_DAYS.map((d) => `/horoscope/${d.key}`),
    ...WEEKDAY_SLUGS.map((w) => `/daily-color/${w}`),
    ...calendarDays,
  ];
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
