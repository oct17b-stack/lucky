import type { Locale } from '@lucky/content';

/** 括注：中文用全角括号，泰文和英文用半角括号加空格 */
export function paren(locale: Locale, main: string, note: string): string {
  return locale === 'zh-hans' || locale === 'zh-hant' ? `${main}（${note}）` : `${main} (${note})`;
}
