import type { Locale } from './locales.ts';
import { en } from './messages/en.ts';
import { th } from './messages/th.ts';
import { type Messages, zhHans } from './messages/zh-hans.ts';
import { zhHant } from './messages/zh-hant.ts';

export * from './locales.ts';
export type { Messages };

const MESSAGES: Record<Locale, Messages> = {
  th,
  'zh-hans': zhHans,
  'zh-hant': zhHant,
  en,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

/** 简单插值："{years} 岁" + { years: 3 } → "3 岁" */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
export { renderBaziReading, type ConclusionLike } from './rules/bazi.ts';
