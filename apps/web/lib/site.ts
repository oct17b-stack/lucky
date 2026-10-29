import { LOCALES, LOCALE_META, isLocale, type Locale } from '@lucky/content';
import { notFound } from 'next/navigation';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const IS_STAGING = process.env.APP_ENV === 'staging';

/** 公开页面列表：用于站点地图和 hreflang */
export const PUBLIC_PATHS = ['', '/bazi', '/lucky-color', '/phone-number'] as const;

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/** 生成 canonical 与 hreflang（含 x-default，指向泰文版） */
export function alternatesFor(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_META[l].hreflang] = `${SITE_URL}/${l}${path}`;
  languages['x-default'] = `${SITE_URL}/th${path}`;
  return { canonical: `${SITE_URL}/${locale}${path}`, languages };
}
