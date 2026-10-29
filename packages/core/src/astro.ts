/**
 * 太阳视黄经与二十四节气时刻。
 *
 * 当前实现：Meeus《天文算法》第 25 章低精度太阳位置（约 ±0.01°，节气时刻约 ±15 分钟）。
 * 这是框架阶段的默认实现，不依赖任何第三方包。
 * 正式上线前用 setSunLongitudeProvider() 换成 astronomy-engine（MIT）或 Swiss Ephemeris，
 * 并让金标准测试集把误差压到 1 分钟以内（见 test/astro.test.ts）。
 */
import { julianDayFromMs, msFromJulianDay } from './time.ts';

const DEG = Math.PI / 180;

/** 输入力学时儒略日（TT），返回太阳视黄经（度，0–360） */
export type SunLongitudeProvider = (jdTT: number) => number;

export const meeusLowPrecisionSun: SunLongitudeProvider = (jdTT) => {
  const t = (jdTT - 2451545.0) / 36525;
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * DEG;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m);
  const omega = (125.04 - 1934.136 * t) * DEG;
  const apparent = l0 + c - 0.00569 - 0.00478 * Math.sin(omega);
  return normalizeDegrees(apparent);
};

let provider: SunLongitudeProvider = meeusLowPrecisionSun;
let providerName = 'meeus-low-precision';

/** 替换太阳位置算法（例如接入 astronomy-engine） */
export function setSunLongitudeProvider(fn: SunLongitudeProvider, name: string): void {
  provider = fn;
  providerName = name;
}

export function sunLongitudeProviderName(): string {
  return providerName;
}

export function normalizeDegrees(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** ΔT = TT − UT（秒），Espenak & Meeus 多项式，覆盖 1900–2150 年 */
export function deltaTSeconds(decimalYear: number): number {
  const y = decimalYear;
  if (y < 1900) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u;
  }
  if (y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }
  if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }
  if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }
  if (y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }
  if (y < 2150) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u - 0.5628 * (2150 - y);
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

function decimalYearFromJd(jd: number): number {
  return 2000 + (jd - 2451545.0) / 365.25;
}

/** 某一 UTC 时刻的太阳视黄经（度） */
export function sunLongitudeAt(utcMs: number): number {
  const jd = julianDayFromMs(utcMs);
  return provider(jd + deltaTSeconds(decimalYearFromJd(jd)) / 86400);
}

/** 从 guessUtcMs 附近求太阳视黄经等于 targetDeg 的 UTC 时刻 */
export function findSunLongitudeUtc(targetDeg: number, guessUtcMs: number): number {
  let jd = julianDayFromMs(guessUtcMs);
  for (let i = 0; i < 50; i++) {
    const lon = provider(jd + deltaTSeconds(decimalYearFromJd(jd)) / 86400);
    let diff = normalizeDegrees(targetDeg - lon);
    if (diff > 180) diff -= 360;
    jd += diff / 0.98564736;
    if (Math.abs(diff) < 1e-7) break;
  }
  return msFromJulianDay(jd);
}

/** 二十四节气，按太阳视黄经从小寒开始排（与公历年内顺序一致） */
export const SOLAR_TERMS = [
  { name: '小寒', longitude: 285, isJie: true },
  { name: '大寒', longitude: 300, isJie: false },
  { name: '立春', longitude: 315, isJie: true },
  { name: '雨水', longitude: 330, isJie: false },
  { name: '惊蛰', longitude: 345, isJie: true },
  { name: '春分', longitude: 0, isJie: false },
  { name: '清明', longitude: 15, isJie: true },
  { name: '谷雨', longitude: 30, isJie: false },
  { name: '立夏', longitude: 45, isJie: true },
  { name: '小满', longitude: 60, isJie: false },
  { name: '芒种', longitude: 75, isJie: true },
  { name: '夏至', longitude: 90, isJie: false },
  { name: '小暑', longitude: 105, isJie: true },
  { name: '大暑', longitude: 120, isJie: false },
  { name: '立秋', longitude: 135, isJie: true },
  { name: '处暑', longitude: 150, isJie: false },
  { name: '白露', longitude: 165, isJie: true },
  { name: '秋分', longitude: 180, isJie: false },
  { name: '寒露', longitude: 195, isJie: true },
  { name: '霜降', longitude: 210, isJie: false },
  { name: '立冬', longitude: 225, isJie: true },
  { name: '小雪', longitude: 240, isJie: false },
  { name: '大雪', longitude: 255, isJie: true },
  { name: '冬至', longitude: 270, isJie: false },
] as const;

export type SolarTermName = (typeof SOLAR_TERMS)[number]['name'];

/** 某公历年内某个节气的 UTC 时刻 */
export function solarTermUtc(year: number, termName: SolarTermName): number {
  const term = SOLAR_TERMS.find((t) => t.name === termName);
  if (!term) throw new Error(`未知节气：${termName}`);
  // 黄经 285–360 的节气（小寒到惊蛰）落在公历年初，从上一年春分起推
  const baseYear = term.longitude >= 285 ? year - 1 : year;
  const equinoxGuess = Date.UTC(baseYear, 2, 20);
  const guess = equinoxGuess + (normalizeDegrees(term.longitude) / 360) * 365.2422 * 86_400_000;
  return findSunLongitudeUtc(term.longitude, guess);
}

/** 返回某年全部 24 个节气（按时间顺序） */
export function solarTermsOfYear(year: number): { name: SolarTermName; utcMs: number }[] {
  return SOLAR_TERMS.map((t) => ({ name: t.name, utcMs: solarTermUtc(year, t.name) }));
}
