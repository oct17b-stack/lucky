/**
 * 八字排盘。
 *
 * 规则（全部可在 options 中切换，并记录在输出的 meta 里，保证结果可复现）：
 * - 年柱：以立春的精确时刻为界
 * - 月柱：以“节”的精确时刻为界（按太阳视黄经判断），月干按五虎遁
 * - 日柱：按出生地日期推算；默认用真太阳时；默认 23:00 换日
 * - 时柱：按真太阳时划分时辰，时干按五鼠遁
 * - 大运：阳男阴女顺排，阴男阳女逆排；起运按“三天折一年”
 */
import {
  type GanZhi,
  type TenGod,
  ELEMENTS,
  HIDDEN_STEMS,
  ZODIAC_ANIMALS,
  branchElement,
  ganzhiFromIndex,
  ganzhiFromStemBranch,
  isYangStem,
  mod,
  nayin,
  stemElement,
  tenGod,
} from './ganzhi.ts';
import { findSunLongitudeUtc, normalizeDegrees, solarTermUtc, sunLongitudeAt, sunLongitudeProviderName } from './astro.ts';
import {
  type LocalDateTime,
  formatWallClock,
  julianDayNumber,
  trueSolarTimeMs,
  wallClockFromMs,
  zonedTimeToUtc,
} from './time.ts';

export const ENGINE_VERSION = '0.1.0';

/** 1949-10-01 为甲子日，用作日柱推算的锚点 */
const JIAZI_DAY_JDN = 2433191;
const MS_PER_DAY = 86_400_000;

export type ZiHourRule =
  /** 23:00 即换日（默认），日柱、时柱都按次日 */
  | 'next-day-at-23'
  /** 早晚子时分开：23:00–24:00 日柱仍按当天，时干按次日日干起 */
  | 'split';

export interface BaziOptions {
  /** 是否使用真太阳时（默认 true） */
  trueSolarTime: boolean;
  ziHour: ZiHourRule;
}

export const DEFAULT_BAZI_OPTIONS: BaziOptions = {
  trueSolarTime: true,
  ziHour: 'next-day-at-23',
};

export interface BaziInput {
  /** 出生地钟表时间 */
  birth: LocalDateTime;
  /** IANA 时区，例如 Asia/Bangkok */
  timeZone: string;
  /** 出生地经度（东经为正） */
  longitude: number;
  gender: 'male' | 'female';
  options?: Partial<BaziOptions>;
}

export interface HiddenStem {
  stem: string;
  element: string;
  tenGod: TenGod;
}

export interface Pillar {
  name: string;
  stem: string;
  branch: string;
  stemElement: string;
  branchElement: string;
  nayin: string;
  /** 日柱天干为日主，此处为 null */
  stemTenGod: TenGod | null;
  hiddenStems: HiddenStem[];
}

export interface LuckPillar {
  name: string;
  /** 开始的虚拟年龄（周岁，含小数） */
  startAge: number;
  startYear: number;
}

export interface BaziResult {
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  dayMaster: { stem: string; element: string; yang: boolean };
  zodiac: string;
  /** 八个字的五行计数（天干 + 地支本气） */
  elementCount: Record<string, number>;
  luck: {
    forward: boolean;
    startAge: { years: number; months: number; days: number };
    pillars: LuckPillar[];
  };
  meta: {
    engineVersion: string;
    sunModel: string;
    options: BaziOptions;
    utc: string;
    utcOffsetMinutes: number;
    /** 用于定日、定时的时间（真太阳时或钟表时间） */
    calcTime: string;
    lichun: string;
  };
}

function buildPillar(gz: GanZhi, dayMasterStem: number, isDayPillar: boolean): Pillar {
  return {
    name: gz.name,
    stem: gz.name[0]!,
    branch: gz.name[1]!,
    stemElement: ELEMENTS[stemElement(gz.stem)]!,
    branchElement: ELEMENTS[branchElement(gz.branch)]!,
    nayin: nayin(gz),
    stemTenGod: isDayPillar ? null : tenGod(dayMasterStem, gz.stem),
    hiddenStems: HIDDEN_STEMS[gz.branch]!.map((s) => ({
      stem: ganzhiFromIndex(s).name[0]!,
      element: ELEMENTS[stemElement(s)]!,
      tenGod: tenGod(dayMasterStem, s),
    })),
  };
}

function addDays(t: LocalDateTime, days: number): LocalDateTime {
  const ms = Date.UTC(t.year, t.month - 1, t.day + days, t.hour, t.minute);
  return wallClockFromMs(ms);
}

export function computeBazi(input: BaziInput): BaziResult {
  const options: BaziOptions = { ...DEFAULT_BAZI_OPTIONS, ...input.options };
  validateInput(input);

  // 1. 钟表时间 → UTC
  const { utcMs, offsetMinutes } = zonedTimeToUtc(input.birth, input.timeZone);

  // 2. 定日、定时所用的时间
  const calcTime = options.trueSolarTime
    ? wallClockFromMs(trueSolarTimeMs(utcMs, input.longitude))
    : { ...input.birth };

  // 3. 年柱：以立春时刻为界
  const utcYear = new Date(utcMs).getUTCFullYear();
  const lichunThisYear = solarTermUtc(utcYear, '立春');
  const pillarYear = utcMs >= lichunThisYear ? utcYear : utcYear - 1;
  const lichunUsed = pillarYear === utcYear ? lichunThisYear : solarTermUtc(pillarYear, '立春');
  const yearGz = ganzhiFromIndex(pillarYear - 4);

  // 4. 月柱：按太阳视黄经落在哪个“节”之后
  const sunLon = sunLongitudeAt(utcMs);
  const monthOffset = Math.floor(normalizeDegrees(sunLon - 315) / 30); // 0 = 寅月
  const monthBranch = mod(2 + monthOffset, 12);
  const firstMonthStem = mod((yearGz.stem % 5) * 2 + 2, 10); // 五虎遁
  const monthGz = ganzhiFromStemBranch(mod(firstMonthStem + monthOffset, 10), monthBranch);

  // 5. 日柱
  const lateZi = calcTime.hour >= 23;
  const dayDate = lateZi && options.ziHour === 'next-day-at-23' ? addDays(calcTime, 1) : calcTime;
  const dayGz = ganzhiFromIndex(julianDayNumber(dayDate.year, dayDate.month, dayDate.day) - JIAZI_DAY_JDN);

  // 6. 时柱：五鼠遁
  const hourBranch = Math.floor((calcTime.hour + 1) / 2) % 12;
  const stemForHour = lateZi && options.ziHour === 'split' ? dayGz.stem + 1 : dayGz.stem;
  const hourGz = ganzhiFromStemBranch(mod((stemForHour % 5) * 2 + hourBranch, 10), hourBranch);

  const dm = dayGz.stem;
  const pillars = {
    year: buildPillar(yearGz, dm, false),
    month: buildPillar(monthGz, dm, false),
    day: buildPillar(dayGz, dm, true),
    hour: buildPillar(hourGz, dm, false),
  };

  // 7. 五行计数
  const elementCount: Record<string, number> = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  for (const gz of [yearGz, monthGz, dayGz, hourGz]) {
    elementCount[ELEMENTS[stemElement(gz.stem)]!]! += 1;
    elementCount[ELEMENTS[branchElement(gz.branch)]!]! += 1;
  }

  // 8. 大运
  const forward = isYangStem(yearGz.stem) === (input.gender === 'male');
  const monthStartLon = normalizeDegrees(315 + monthOffset * 30);
  const daysSinceJie = normalizeDegrees(sunLon - monthStartLon) / 0.9856;
  const prevJie = findSunLongitudeUtc(monthStartLon, utcMs - daysSinceJie * MS_PER_DAY);
  const nextJie = findSunLongitudeUtc(monthStartLon + 30, utcMs + (30 / 0.9856 - daysSinceJie) * MS_PER_DAY);
  const spanDays = (forward ? nextJie - utcMs : utcMs - prevJie) / MS_PER_DAY;
  // 三天折一年：1 天 = 4 个月，1 个时辰（2 小时）= 10 天
  const totalMonths = spanDays * 4;
  const years = Math.floor(totalMonths / 12);
  const months = Math.floor(totalMonths - years * 12);
  const days = Math.floor((totalMonths - years * 12 - months) * 30);
  const startAgeYears = totalMonths / 12;
  const luckPillars: LuckPillar[] = Array.from({ length: 8 }, (_, i) => {
    const gz = ganzhiFromIndex(monthGz.index + (forward ? i + 1 : -(i + 1)));
    const startAge = Math.round((startAgeYears + i * 10) * 100) / 100;
    return { name: gz.name, startAge, startYear: input.birth.year + Math.floor(startAge) };
  });

  return {
    pillars,
    dayMaster: { stem: pillars.day.stem, element: pillars.day.stemElement, yang: isYangStem(dm) },
    zodiac: ZODIAC_ANIMALS[yearGz.branch]!,
    elementCount,
    luck: { forward, startAge: { years, months, days }, pillars: luckPillars },
    meta: {
      engineVersion: ENGINE_VERSION,
      sunModel: sunLongitudeProviderName(),
      options,
      utc: new Date(utcMs).toISOString(),
      utcOffsetMinutes: offsetMinutes,
      calcTime: formatWallClock(calcTime),
      lichun: new Date(lichunUsed).toISOString(),
    },
  };
}

function validateInput(input: BaziInput): void {
  const { year, month, day, hour, minute } = input.birth;
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new RangeError('年份需在 1900–2100 之间');
  if (month < 1 || month > 12) throw new RangeError('月份无效');
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) throw new RangeError('日期无效');
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new RangeError('时间无效');
  if (!(input.longitude >= -180 && input.longitude <= 180)) throw new RangeError('经度无效');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: input.timeZone });
  } catch {
    throw new RangeError(`未知时区：${input.timeZone}`);
  }
}
