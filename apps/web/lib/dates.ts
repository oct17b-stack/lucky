import type { Locale } from '@lucky/content';

/** Intl 语言标签：泰文默认使用佛历（พ.ศ.） */
export function intlTag(locale: Locale): string {
  return { th: 'th-TH', 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW', en: 'en-GB' }[locale];
}

const at = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

/** 完整日期，例如“วันศุกร์ที่ 30 ตุลาคม พ.ศ. 2569” */
export function formatDateFull(locale: Locale, d: { year: number; month: number; day: number }): string {
  return new Intl.DateTimeFormat(intlTag(locale), { dateStyle: 'full', timeZone: 'UTC' }).format(at(d.year, d.month, d.day));
}

/** 短日期，例如“30 ต.ค. 2569” */
export function formatDateShort(locale: Locale, d: { year: number; month: number; day: number }): string {
  return new Intl.DateTimeFormat(intlTag(locale), { dateStyle: 'medium', timeZone: 'UTC' }).format(at(d.year, d.month, d.day));
}

/** 星期名称，例如“วันจันทร์” */
export function weekdayName(locale: Locale, d: { year: number; month: number; day: number }): string {
  return new Intl.DateTimeFormat(intlTag(locale), { weekday: 'long', timeZone: 'UTC' }).format(at(d.year, d.month, d.day));
}

/** 12 个月的名称 */
export function monthNames(locale: Locale): string[] {
  const f = new Intl.DateTimeFormat(intlTag(locale), { month: 'long', timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => f.format(at(2000, i + 1, 1)));
}

/** 界面上显示的年份：泰文用佛历 */
export function displayYear(locale: Locale, gregorianYear: number): number {
  return locale === 'th' ? gregorianYear + 543 : gregorianYear;
}

export function fromDisplayYear(locale: Locale, shown: number): number {
  return locale === 'th' ? shown - 543 : shown;
}
