import type { Locale } from './locales.ts';
import { THAI_FEATURE_TEXTS, type ThaiFeatureTexts } from './features/thai.ts';
import { TOOLS_TEXTS, type ToolsTexts } from './features/tools.ts';
import { en } from './messages/en.ts';
import { th } from './messages/th.ts';
import { type Messages as BaseMessages, zhHans } from './messages/zh-hans.ts';
import { zhHant } from './messages/zh-hant.ts';

export * from './locales.ts';

/** 全部界面文案：基础文案 + 各功能文案 */
export type Messages = BaseMessages & ThaiFeatureTexts & ToolsTexts;

const BASE: Record<Locale, BaseMessages> = {
  th,
  'zh-hans': zhHans,
  'zh-hant': zhHant,
  en,
};

const MESSAGES: Record<Locale, Messages> = Object.fromEntries(
  (Object.keys(BASE) as Locale[]).map((l) => [l, { ...BASE[l], ...THAI_FEATURE_TEXTS[l], ...TOOLS_TEXTS[l] }]),
) as Record<Locale, Messages>;

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

/** 简单插值："{years} 岁" + { years: 3 } → "3 岁" */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export { renderBaziReading, type ConclusionLike } from './rules/bazi.ts';
export { SIAMSI, SIAMSI_TOPICS, type SiamsiStick, type SiamsiTopic } from './rules/siamsi.ts';
export { TAROT_MAJOR, type TarotCard } from './rules/tarot.ts';
