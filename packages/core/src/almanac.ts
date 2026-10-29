/**
 * 每日万年历：公历、佛历、农历、干支、冲煞生肖、当日节气、星期代表色。
 * 全部可由日期确定性算出，适合生成程序化 SEO 页面。
 */
import { BRANCHES, ZODIAC_ANIMALS, mod } from './ganzhi.ts';
import { SOLAR_TERMS, solarTermUtc, type SolarTermName } from './astro.ts';
import { computeBazi } from './bazi.ts';
import { solarToLunar, formatLunarChinese, type LunarDate } from './lunar.ts';
import { thaiBirthDay, toBuddhistYear, type ThaiBirthDayInfo } from './thai/birthday.ts';
import { timeZoneOffsetMinutes } from './time.ts';

export type ZodiacLocale = 'th' | 'zh-hans' | 'zh-hant' | 'en';

/** 生肖名称：泰文用泰历年名（ปีชวด 等）并附动物名 */
export const ZODIAC_NAMES: Record<ZodiacLocale, readonly string[]> = {
  'zh-hans': ZODIAC_ANIMALS,
  'zh-hant': ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'],
  th: [
    'ชวด (หนู)', 'ฉลู (วัว)', 'ขาล (เสือ)', 'เถาะ (กระต่าย)', 'มะโรง (งูใหญ่)', 'มะเส็ง (งูเล็ก)',
    'มะเมีย (ม้า)', 'มะแม (แพะ)', 'วอก (ลิง)', 'ระกา (ไก่)', 'จอ (สุนัข)', 'กุน (หมู)',
  ],
  en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
};

/** 节气名称：繁体与英文（泰文版显示英文译名并附中文） */
export const SOLAR_TERM_NAMES: Record<SolarTermName, { 'zh-hant': string; en: string }> = {
  小寒: { 'zh-hant': '小寒', en: 'Minor Cold' },
  大寒: { 'zh-hant': '大寒', en: 'Major Cold' },
  立春: { 'zh-hant': '立春', en: 'Start of Spring' },
  雨水: { 'zh-hant': '雨水', en: 'Rain Water' },
  惊蛰: { 'zh-hant': '驚蟄', en: 'Awakening of Insects' },
  春分: { 'zh-hant': '春分', en: 'Spring Equinox' },
  清明: { 'zh-hant': '清明', en: 'Pure Brightness' },
  谷雨: { 'zh-hant': '穀雨', en: 'Grain Rain' },
  立夏: { 'zh-hant': '立夏', en: 'Start of Summer' },
  小满: { 'zh-hant': '小滿', en: 'Grain Buds' },
  芒种: { 'zh-hant': '芒種', en: 'Grain in Ear' },
  夏至: { 'zh-hant': '夏至', en: 'Summer Solstice' },
  小暑: { 'zh-hant': '小暑', en: 'Minor Heat' },
  大暑: { 'zh-hant': '大暑', en: 'Major Heat' },
  立秋: { 'zh-hant': '立秋', en: 'Start of Autumn' },
  处暑: { 'zh-hant': '處暑', en: 'End of Heat' },
  白露: { 'zh-hant': '白露', en: 'White Dew' },
  秋分: { 'zh-hant': '秋分', en: 'Autumn Equinox' },
  寒露: { 'zh-hant': '寒露', en: 'Cold Dew' },
  霜降: { 'zh-hant': '霜降', en: "Frost's Descent" },
  立冬: { 'zh-hant': '立冬', en: 'Start of Winter' },
  小雪: { 'zh-hant': '小雪', en: 'Minor Snow' },
  大雪: { 'zh-hant': '大雪', en: 'Major Snow' },
  冬至: { 'zh-hant': '冬至', en: 'Winter Solstice' },
};

export function solarTermLabel(name: SolarTermName, locale: ZodiacLocale): string {
  if (locale === 'zh-hans') return name;
  if (locale === 'zh-hant') return SOLAR_TERM_NAMES[name]['zh-hant'];
  return `${SOLAR_TERM_NAMES[name].en} (${name})`;
}

export interface DailyAlmanac {
  date: { year: number; month: number; day: number };
  buddhistYear: number;
  lunar: LunarDate & { chinese: string };
  /** 干支：年柱按立春换年，月柱按“节”换月 */
  ganzhi: { year: string; month: string; day: string };
  /** 当日地支所冲的生肖索引（子午冲、丑未冲……） */
  clashZodiacIndex: number;
  /** 当日（按所在时区的日期）交节的节气 */
  solarTerm: { name: SolarTermName; utc: string } | null;
  weekday: ThaiBirthDayInfo;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/** 生成某一天的万年历信息；timeZone 决定节气落在哪一天（默认曼谷） */
export function dailyAlmanac(year: number, month: number, day: number, timeZone = 'Asia/Bangkok'): DailyAlmanac {
  if (!isValidDate(year, month, day) || year < 1901 || year > 2099) throw new RangeError('日期无效或超出 1901–2099 年');

  const chart = computeBazi({
    birth: { year, month, day, hour: 12, minute: 0 },
    timeZone,
    longitude: 0,
    gender: 'male',
    options: { trueSolarTime: false },
  });

  const lunar = solarToLunar(year, month, day);
  const dayBranch = BRANCHES.indexOf(chart.pillars.day.branch as (typeof BRANCHES)[number]);

  let solarTerm: DailyAlmanac['solarTerm'] = null;
  for (const t of SOLAR_TERMS) {
    const utc = solarTermUtc(year, t.name);
    const local = new Date(utc + timeZoneOffsetMinutes(timeZone, utc) * 60_000);
    if (local.getUTCMonth() + 1 === month && local.getUTCDate() === day) {
      solarTerm = { name: t.name, utc: new Date(utc).toISOString() };
      break;
    }
  }

  return {
    date: { year, month, day },
    buddhistYear: toBuddhistYear(year),
    lunar: { ...lunar, chinese: formatLunarChinese(lunar) },
    ganzhi: { year: chart.pillars.year.name, month: chart.pillars.month.name, day: chart.pillars.day.name },
    clashZodiacIndex: mod(dayBranch + 6, 12),
    solarTerm,
    weekday: thaiBirthDay({ year, month, day, hour: 12, minute: 0 }, { dayStartsAtSunrise: false }),
  };
}

/** 某个时区“今天”的公历日期 */
export function todayIn(timeZone: string, now = Date.now()): { year: number; month: number; day: number } {
  const local = new Date(now + timeZoneOffsetMinutes(timeZone, now) * 60_000);
  return { year: local.getUTCFullYear(), month: local.getUTCMonth() + 1, day: local.getUTCDate() };
}
