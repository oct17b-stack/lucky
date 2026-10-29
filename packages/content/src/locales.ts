export const LOCALES = ['th', 'zh-hans', 'zh-hant', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** 泰国是首要市场，默认语言为泰文 */
export const DEFAULT_LOCALE: Locale = 'th';

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; hreflang: string; ogLocale: string }> = {
  th: { label: 'ไทย', htmlLang: 'th', hreflang: 'th', ogLocale: 'th_TH' },
  'zh-hans': { label: '简体中文', htmlLang: 'zh-Hans', hreflang: 'zh-Hans', ogLocale: 'zh_CN' },
  'zh-hant': { label: '繁體中文', htmlLang: 'zh-Hant', hreflang: 'zh-Hant', ogLocale: 'zh_TW' },
  en: { label: 'English', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * 根据浏览器 Accept-Language 选择语言。
 * zh-TW / zh-HK / zh-Hant → 繁体；其他中文 → 简体；泰文 → th；英文 → en；都不匹配 → 默认泰文。
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const tags = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    if (tag.startsWith('th')) return 'th';
    if (tag.startsWith('zh')) {
      return /hant|tw|hk|mo/.test(tag) ? 'zh-hant' : 'zh-hans';
    }
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}
