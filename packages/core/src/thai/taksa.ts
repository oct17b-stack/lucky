/**
 * ทักษา（Thai Taksa）：泰式命理的基础，用于取名、幸运色、择日、配对。
 *
 * 规则（泰国通行的标准排法）：
 * - 八曜按 ทักษา 顺序绕行：อาทิตย์(1) → จันทร์(2) → อังคาร(3) → พุธ(4) → เสาร์(7) → พฤหัสบดี(5) → ราหู(8) → ศุกร์(6)
 * - 以出生星期对应的星曜为“บริวาร”，沿上述顺序依次为
 *   บริวาร、อายุ、เดช、ศรี、มูละ、อุตสาหะ、มนตรี、กาลกิณี 八宫
 * - 星期三夜晚出生（พุธกลางคืน）对应 ราหู(8)
 * 例：星期日出生，กาลกิณี 是 ศุกร์，忌用 ศ ษ ส ห ฬ ฮ。
 */
import type { ThaiBirthDayKey } from './birthday.ts';

export type Planet = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu';

export interface PlanetInfo {
  key: Planet;
  /** 泰式星曜编号 1–8 */
  number: number;
  name: { th: string; 'zh-hans': string; 'zh-hant': string; en: string };
  /** 该星曜对应的颜色（用于幸运色） */
  color: { th: string; 'zh-hans': string; 'zh-hant': string; en: string; hex: string };
  /** 该星曜的字母组（用于取名、车牌） */
  letters: readonly string[];
}

/** 元音组（归 อาทิตย์）：อ、独立元音和元音符号 */
const VOWELS = ['อ', 'ะ', 'ั', 'า', 'ำ', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 'เ', 'แ', 'โ', 'ใ', 'ไ', '็', 'ฤ', 'ฦ', 'ๅ'] as const;

export const PLANETS: Record<Planet, PlanetInfo> = {
  sun: {
    key: 'sun',
    number: 1,
    name: { th: 'อาทิตย์', 'zh-hans': '太阳', 'zh-hant': '太陽', en: 'Sun' },
    color: { th: 'แดง', 'zh-hans': '红色', 'zh-hant': '紅色', en: 'Red', hex: '#d32f2f' },
    letters: VOWELS,
  },
  moon: {
    key: 'moon',
    number: 2,
    name: { th: 'จันทร์', 'zh-hans': '月亮', 'zh-hant': '月亮', en: 'Moon' },
    color: { th: 'เหลือง', 'zh-hans': '黄色', 'zh-hant': '黃色', en: 'Yellow', hex: '#f2c200' },
    letters: ['ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง'],
  },
  mars: {
    key: 'mars',
    number: 3,
    name: { th: 'อังคาร', 'zh-hans': '火星', 'zh-hant': '火星', en: 'Mars' },
    color: { th: 'ชมพู', 'zh-hans': '粉色', 'zh-hant': '粉色', en: 'Pink', hex: '#ec6fa4' },
    letters: ['จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ'],
  },
  mercury: {
    key: 'mercury',
    number: 4,
    name: { th: 'พุธ', 'zh-hans': '水星', 'zh-hant': '水星', en: 'Mercury' },
    color: { th: 'เขียว', 'zh-hans': '绿色', 'zh-hant': '綠色', en: 'Green', hex: '#2e9e4f' },
    letters: ['ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ'],
  },
  jupiter: {
    key: 'jupiter',
    number: 5,
    name: { th: 'พฤหัสบดี', 'zh-hans': '木星', 'zh-hant': '木星', en: 'Jupiter' },
    color: { th: 'ส้ม', 'zh-hans': '橙色', 'zh-hant': '橙色', en: 'Orange', hex: '#f08a24' },
    letters: ['บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม'],
  },
  venus: {
    key: 'venus',
    number: 6,
    name: { th: 'ศุกร์', 'zh-hans': '金星', 'zh-hant': '金星', en: 'Venus' },
    color: { th: 'ฟ้า', 'zh-hans': '天蓝色', 'zh-hant': '天藍色', en: 'Light blue', hex: '#4aa3df' },
    letters: ['ศ', 'ษ', 'ส', 'ห', 'ฬ', 'ฮ'],
  },
  saturn: {
    key: 'saturn',
    number: 7,
    name: { th: 'เสาร์', 'zh-hans': '土星', 'zh-hant': '土星', en: 'Saturn' },
    color: { th: 'ม่วง', 'zh-hans': '紫色', 'zh-hant': '紫色', en: 'Purple', hex: '#7e4fb3' },
    letters: ['ด', 'ต', 'ถ', 'ท', 'ธ', 'น'],
  },
  rahu: {
    key: 'rahu',
    number: 8,
    name: { th: 'ราหู', 'zh-hans': '罗睺', 'zh-hant': '羅睺', en: 'Rahu' },
    color: { th: 'เทา', 'zh-hans': '灰色', 'zh-hant': '灰色', en: 'Grey', hex: '#6b6b6b' },
    letters: ['ย', 'ร', 'ล', 'ว'],
  },
};

/** ทักษา 绕行顺序 */
export const TAKSA_ORDER: readonly Planet[] = ['sun', 'moon', 'mars', 'mercury', 'saturn', 'jupiter', 'rahu', 'venus'];

export type TaksaHouse = 'boriwan' | 'ayu' | 'det' | 'si' | 'mula' | 'utsaha' | 'montri' | 'kalakini';
export const TAKSA_HOUSES: readonly TaksaHouse[] = ['boriwan', 'ayu', 'det', 'si', 'mula', 'utsaha', 'montri', 'kalakini'];

export const HOUSE_NAMES: Record<TaksaHouse, { th: string; 'zh-hans': string; 'zh-hant': string; en: string }> = {
  boriwan: { th: 'บริวาร', 'zh-hans': '眷属', 'zh-hant': '眷屬', en: 'Companions' },
  ayu: { th: 'อายุ', 'zh-hans': '寿元', 'zh-hant': '壽元', en: 'Longevity' },
  det: { th: 'เดช', 'zh-hans': '威势', 'zh-hant': '威勢', en: 'Power' },
  si: { th: 'ศรี', 'zh-hans': '吉祥', 'zh-hant': '吉祥', en: 'Fortune' },
  mula: { th: 'มูละ', 'zh-hans': '根基', 'zh-hant': '根基', en: 'Foundation' },
  utsaha: { th: 'อุตสาหะ', 'zh-hans': '勤勉', 'zh-hant': '勤勉', en: 'Diligence' },
  montri: { th: 'มนตรี', 'zh-hans': '贵人', 'zh-hant': '貴人', en: 'Patronage' },
  kalakini: { th: 'กาลกิณี', 'zh-hans': '凶煞', 'zh-hant': '凶煞', en: 'Misfortune' },
};

const BIRTHDAY_PLANET: Record<ThaiBirthDayKey, Planet> = {
  sun: 'sun',
  mon: 'moon',
  tue: 'mars',
  'wed-day': 'mercury',
  'wed-night': 'rahu',
  thu: 'jupiter',
  fri: 'venus',
  sat: 'saturn',
};

export function planetOfBirthDay(day: ThaiBirthDayKey): Planet {
  return BIRTHDAY_PLANET[day];
}

/** 由星曜反查生日星期 */
export function birthDayOfPlanet(planet: Planet): ThaiBirthDayKey {
  return (Object.keys(BIRTHDAY_PLANET) as ThaiBirthDayKey[]).find((k) => BIRTHDAY_PLANET[k] === planet)!;
}

/** 某生日星期的 ทักษา：八宫各对应哪颗星曜 */
export function taksaChart(day: ThaiBirthDayKey): Record<TaksaHouse, Planet> {
  const start = TAKSA_ORDER.indexOf(BIRTHDAY_PLANET[day]);
  return Object.fromEntries(TAKSA_HOUSES.map((h, i) => [h, TAKSA_ORDER[(start + i) % 8]!])) as Record<TaksaHouse, Planet>;
}

/** 星曜 planet 落在生日星期 day 的哪一宫 */
export function houseOfPlanet(day: ThaiBirthDayKey, planet: Planet): TaksaHouse {
  const chart = taksaChart(day);
  return TAKSA_HOUSES.find((h) => chart[h] === planet)!;
}

/** 字符属于哪颗星曜；声调符号等不计入，返回 null */
export function planetOfLetter(ch: string): Planet | null {
  for (const p of TAKSA_ORDER) if (PLANETS[p].letters.includes(ch)) return p;
  return null;
}

// ---------------------------------------------------------------------------
// 每日สีเสื้อมงคล：按“当天”的星期排 ทักษา，各宫星曜的颜色即该用途的幸运色
// ---------------------------------------------------------------------------

export type ColorPurpose = 'work' | 'money' | 'health' | 'patron' | 'charm' | 'success' | 'stability' | 'avoid';

/** 用途 → 宫位 */
export const PURPOSE_HOUSE: Record<ColorPurpose, TaksaHouse> = {
  work: 'det',
  money: 'si',
  health: 'ayu',
  patron: 'montri',
  charm: 'boriwan',
  success: 'utsaha',
  stability: 'mula',
  avoid: 'kalakini',
};

export const DAILY_COLOR_RULES = 'taksa-by-weekday' as const;

const WEEKDAY_DAY_KEY: readonly ThaiBirthDayKey[] = ['sun', 'mon', 'tue', 'wed-day', 'thu', 'fri', 'sat'];

/** 星期几（0=周日）→ 用于穿衣的星期（星期三按白天） */
export function weekdayKey(weekday: number): ThaiBirthDayKey {
  return WEEKDAY_DAY_KEY[((weekday % 7) + 7) % 7]!;
}

/** 某一星期的每日幸运色 */
export function dailyColors(weekday: number): Record<ColorPurpose, PlanetInfo> {
  const chart = taksaChart(weekdayKey(weekday));
  return Object.fromEntries(
    (Object.keys(PURPOSE_HOUSE) as ColorPurpose[]).map((p) => [p, PLANETS[chart[PURPOSE_HOUSE[p]]]]),
  ) as Record<ColorPurpose, PlanetInfo>;
}

/** 某个日期的星期（0=周日） */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

// ---------------------------------------------------------------------------
// ดวงรายวันตามวันเกิด：当天星曜落在本人 ทักษา 的哪一宫
// ---------------------------------------------------------------------------

export interface DailyTaksaReading {
  birthDay: ThaiBirthDayKey;
  date: { year: number; month: number; day: number };
  /** 当天星曜 */
  dayPlanet: Planet;
  /** 当天星曜在本人 ทักษา 中的宫位，决定当天主题 */
  house: TaksaHouse;
  /** 本人的 ศรี 星曜编号，作为幸运数字 */
  luckyNumbers: number[];
  /** 本人的 ศรี、เดช 颜色和当天要避开的颜色 */
  colors: { money: PlanetInfo; work: PlanetInfo; avoid: PlanetInfo };
}

export function dailyTaksaReading(birthDay: ThaiBirthDayKey, year: number, month: number, day: number): DailyTaksaReading {
  const dayPlanet = planetOfBirthDay(weekdayKey(weekdayOf(year, month, day)));
  const mine = taksaChart(birthDay);
  const today = dailyColors(weekdayOf(year, month, day));
  return {
    birthDay,
    date: { year, month, day },
    dayPlanet,
    house: houseOfPlanet(birthDay, dayPlanet),
    luckyNumbers: [PLANETS[mine.si].number, PLANETS[mine.det].number],
    colors: { money: PLANETS[mine.si], work: PLANETS[mine.det], avoid: today.avoid },
  };
}
