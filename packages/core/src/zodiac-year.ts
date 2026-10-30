/**
 * 生肖（ปีนักษัตร）换年规则。各地习惯不同，做成选项，结果页注明使用的规则。
 * - lichun：立春（八字命理的标准）
 * - lunarNewYear：农历正月初一（中国民间习惯）
 * - songkran：4 月 13 日（泰国传统新年）
 * - jan1：公历 1 月 1 日（泰国官方文件常用）
 */
import { mod } from './ganzhi.ts';
import { solarTermUtc } from './astro.ts';
import { lunarToSolar } from './lunar.ts';

export type ZodiacYearRule = 'lichun' | 'lunarNewYear' | 'songkran' | 'jan1';
export const ZODIAC_YEAR_RULES: readonly ZodiacYearRule[] = ['lichun', 'lunarNewYear', 'songkran', 'jan1'];

function before(a: { month: number; day: number }, b: { month: number; day: number }): boolean {
  return a.month < b.month || (a.month === b.month && a.day < b.day);
}

/** 返回生肖地支索引（0=鼠） */
export function zodiacIndexFor(date: { year: number; month: number; day: number }, rule: ZodiacYearRule): number {
  let year = date.year;
  if (rule === 'lichun') {
    const t = new Date(solarTermUtc(date.year, '立春') + 8 * 3_600_000); // 按北京时间日期
    if (before(date, { month: t.getUTCMonth() + 1, day: t.getUTCDate() })) year -= 1;
  } else if (rule === 'lunarNewYear') {
    if (before(date, lunarToSolar(date.year, 1, 1))) year -= 1;
  } else if (rule === 'songkran') {
    if (before(date, { month: 4, day: 13 })) year -= 1;
  }
  return mod(year - 4, 12);
}
