/**
 * 农历（中国阴阳历）换算。
 *
 * 规则（与中国现行《农历的编算和颁行》国家标准一致）：
 * - 以北京时间（UTC+8）判断日期；朔日（新月所在日）为每月初一
 * - 含冬至的月份为十一月
 * - 两个冬至之间若有 13 个朔望月，则其中第一个不含“中气”的月份为闰月，沿用上一个月的序号
 * 新月和中气时刻由 astronomy-engine 计算。
 */
import { SearchMoonPhase } from 'astronomy-engine';
import { solarTermUtc, SOLAR_TERMS } from './astro.ts';

const MS_PER_DAY = 86_400_000;
const CST_OFFSET_MS = 8 * 3_600_000;

/** UTC 毫秒 → 北京时间的日序号（1970-01-01 为 0） */
function cstDayNumber(utcMs: number): number {
  return Math.floor((utcMs + CST_OFFSET_MS) / MS_PER_DAY);
}

/** 公历日期 → 日序号 */
function dayNumberOf(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function dateOfDayNumber(n: number): { year: number; month: number; day: number } {
  const d = new Date(n * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

interface LunarMonthSpan {
  /** 初一的日序号 */
  start: number;
  /** 农历月序号 1–12 */
  month: number;
  leap: boolean;
  /** 所属农历年（以正月所在公历年命名） */
  lunarYear: number;
}

const ZHONG_QI = SOLAR_TERMS.filter((t) => !t.isJie).map((t) => t.name);

/** 从 fromUtc 起依次求新月时刻，直到超过 untilUtc */
function newMoonsBetween(fromUtc: number, untilUtc: number): number[] {
  const result: number[] = [];
  let t = new Date(fromUtc);
  while (true) {
    const found = SearchMoonPhase(0, t, 40);
    if (!found) throw new Error('新月搜索失败');
    const ms = found.date.getTime();
    if (ms > untilUtc) break;
    result.push(ms);
    t = new Date(ms + 20 * MS_PER_DAY);
  }
  return result;
}

const spanCache = new Map<number, LunarMonthSpan[]>();

/**
 * 公历 y−1 年冬至所在月（十一月）起，到 y 年冬至所在月之前的全部农历月。
 * 返回值按时间顺序，第一个元素是十一月。
 */
function monthsBetweenWinterSolstices(y: number): LunarMonthSpan[] {
  const cached = spanCache.get(y);
  if (cached) return cached;

  const ws1 = cstDayNumber(solarTermUtc(y - 1, '冬至'));
  const ws2 = cstDayNumber(solarTermUtc(y, '冬至'));
  const moons = newMoonsBetween((ws1 - 35) * MS_PER_DAY, (ws2 + 35) * MS_PER_DAY).map(cstDayNumber);

  // 冬至所在月的初一：冬至当天或之前最近的朔日
  const i1 = findLastIndexAtOrBefore(moons, ws1);
  const i2 = findLastIndexAtOrBefore(moons, ws2);
  const lunations = i2 - i1;
  const isLeapYear = lunations === 13;

  // 每个月是否含中气（按北京时间日期判断）
  const zhongQiDays: number[] = [];
  for (const yy of [y - 1, y]) for (const name of ZHONG_QI) zhongQiDays.push(cstDayNumber(solarTermUtc(yy, name)));
  const hasZhongQi = (start: number, end: number) => zhongQiDays.some((d) => d >= start && d < end);

  const spans: LunarMonthSpan[] = [];
  let monthNo = 11;
  let leapAssigned = false;
  for (let i = i1; i < i2; i++) {
    const start = moons[i]!;
    const end = moons[i + 1]!;
    let leap = false;
    if (i > i1 && isLeapYear && !leapAssigned && !hasZhongQi(start, end)) {
      leap = true;
      leapAssigned = true;
    } else if (i > i1) {
      monthNo = (monthNo % 12) + 1;
    }
    // 段首的十一月、十二月（以及闰十一、闰十二）属于上一个农历年
    const lunarYear = monthNo >= 11 ? y - 1 : y;
    spans.push({ start, month: monthNo, leap, lunarYear });
  }
  spans.push({ start: moons[i2]!, month: 11, leap: false, lunarYear: y }); // 哨兵：下一个十一月
  spanCache.set(y, spans);
  return spans;
}

function findLastIndexAtOrBefore(sorted: number[], value: number): number {
  let idx = -1;
  for (let i = 0; i < sorted.length; i++) if (sorted[i]! <= value) idx = i;
  if (idx < 0) throw new Error('朔日数据不足');
  return idx;
}

export interface LunarDate {
  /** 农历年（以正月初一所在公历年命名） */
  year: number;
  month: number;
  day: number;
  leap: boolean;
  /** 本月天数（29 或 30） */
  monthDays: number;
}

/** 公历 → 农历（按北京时间日期），支持 1901–2099 年 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  if (year < 1901 || year > 2099) throw new RangeError('农历换算支持 1901–2099 年');
  const n = dayNumberOf(year, month, day);
  // 本段覆盖“上年冬至所在月”到“本年冬至所在月之前”；本年冬至所在月及之后属于下一段
  let spans = monthsBetweenWinterSolstices(year);
  if (n >= spans[spans.length - 1]!.start) spans = monthsBetweenWinterSolstices(year + 1);
  for (let i = 0; i < spans.length - 1; i++) {
    const s = spans[i]!;
    const e = spans[i + 1]!.start;
    if (n >= s.start && n < e) {
      return { year: s.lunarYear, month: s.month, day: n - s.start + 1, leap: s.leap, monthDays: e - s.start };
    }
  }
  throw new Error(`无法换算 ${year}-${month}-${day}`);
}

/** 某农历年的全部月份（正月到腊月，含闰月），按时间顺序 */
export function lunarYearMonths(lunarYear: number): { month: number; leap: boolean; start: { year: number; month: number; day: number }; days: number }[] {
  const all: { span: LunarMonthSpan; end: number }[] = [];
  for (const y of [lunarYear, lunarYear + 1]) {
    const spans = monthsBetweenWinterSolstices(y);
    for (let i = 0; i < spans.length - 1; i++) all.push({ span: spans[i]!, end: spans[i + 1]!.start });
  }
  return all
    .filter((x) => x.span.lunarYear === lunarYear)
    .map((x) => ({ month: x.span.month, leap: x.span.leap, start: dateOfDayNumber(x.span.start), days: x.end - x.span.start }));
}

/** 农历 → 公历 */
export function lunarToSolar(lunarYear: number, month: number, day: number, leap = false): { year: number; month: number; day: number } {
  const m = lunarYearMonths(lunarYear).find((x) => x.month === month && x.leap === leap);
  if (!m) throw new RangeError(leap ? `${lunarYear} 年没有闰${month}月` : `农历月份无效：${month}`);
  if (day < 1 || day > m.days) throw new RangeError(`该月只有 ${m.days} 天`);
  return dateOfDayNumber(dayNumberOf(m.start.year, m.start.month, m.start.day) + day - 1);
}

const MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const DAY_TENS = ['初', '十', '廿', '三'];
const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/** 中文写法，例如“闰二月初一”“八月十五”“腊月三十” */
export function formatLunarChinese(d: Pick<LunarDate, 'month' | 'day' | 'leap'>, traditional = false): string {
  const month = `${d.leap ? (traditional ? '閏' : '闰') : ''}${MONTH_NAMES[d.month - 1]}月`;
  let day: string;
  if (d.day === 10) day = '初十';
  else if (d.day === 20) day = '二十';
  else if (d.day === 30) day = '三十';
  else day = DAY_TENS[Math.floor(d.day / 10)]! + DIGITS[d.day % 10]!;
  return month + day;
}
