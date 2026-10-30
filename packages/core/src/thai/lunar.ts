/**
 * 泰国阴历（ปฏิทินจันทรคติไทย）与 วันพระ。
 *
 * 年型按传统 สุริยยาตร์ 算法判定（J.C. Eade, "Rules for Interpolation in the Thai Calendar", JSS 88；
 * 实现参照 splendidmoons/suriya-go 的 suriya_year.go 与 helpers.go，MIT 许可）：
 * - 平年 354 天；อธิกวาร 年 355 天（七月 30 天）；อธิกมาส 年 384 天（八月重复，“เดือน 8 หลัง”）
 * - 单月 29 天、双月 30 天；每月前 15 天为 ข้างขึ้น，之后为 ข้างแรม
 * - 以已知的 กฐิน/กัตติกา 满月（ขึ้น 15 ค่ำ เดือน 12）2015-11-25 为锚点，按年型逐年推算
 * - 官方历书在 1994、1997 年与公式不同，这里按官方历书修正
 * 已用泰国官方公布的 2025、2026 年全部 วันพระ 验证（test/thai-lunar.test.ts）。
 */

const MS_PER_DAY = 86_400_000;

interface SuriyaValues {
  kammacubala: number;
  avoman: number;
  tithi: number;
}

function suriyaValues(ceYear: number): SuriyaValues {
  const cs = ceYear - 638;
  const a = cs * 292207 + 373;
  const horakhun = Math.floor(a / 800) + 1;
  const kammacubala = 800 - (a % 800);
  const b = horakhun * 11 + 650;
  const avoman = b % 692;
  const tithi = (Math.floor(b / 692) + horakhun) % 30;
  return { kammacubala, avoman, tithi };
}

function wouldBeAdhikamasa(ce: number): boolean {
  const t = suriyaValues(ce).tithi;
  return (t >= 24 && t <= 29) || (t >= 0 && t <= 5);
}

/** อธิกมาส：下一年也符合条件时，本年不算 */
export function isAthikamat(ce: number): boolean {
  return wouldBeAdhikamasa(ce) && !wouldBeAdhikamasa(ce + 1);
}

function wouldBeAdhikavara(ce: number): boolean {
  const { kammacubala, avoman } = suriyaValues(ce);
  return kammacubala <= 207 ? avoman <= 126 : avoman < 137;
}

/** 官方历书与公式不一致的年份 */
const ATHIKAWAN_EXCEPTIONS: Record<number, boolean> = { 1994: false, 1997: true };

/** อธิกวาร：同一年不能既闰月又闰日，被挡掉的闰日顺延到下一年 */
export function isAthikawan(ce: number): boolean {
  if (ce in ATHIKAWAN_EXCEPTIONS) return ATHIKAWAN_EXCEPTIONS[ce]!;
  if (isAthikamat(ce)) return false;
  const carried = isAthikamat(ce - 1) && wouldBeAdhikavara(ce - 1);
  return carried || wouldBeAdhikavara(ce);
}

export type ThaiLunarYearType = 'normal' | 'athikamat' | 'athikawan';

/** 公历年 ce 年中（六至八月）所在阴历年的年型 */
export function thaiLunarYearType(ce: number): ThaiLunarYearType {
  if (isAthikamat(ce)) return 'athikamat';
  if (isAthikawan(ce)) return 'athikawan';
  return 'normal';
}

function yearLength(ce: number): number {
  return { normal: 354, athikawan: 355, athikamat: 384 }[thaiLunarYearType(ce)];
}

const dayNumber = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
const KATTIKA_ANCHOR = { year: 2015, day: dayNumber(2015, 11, 25) };

const kattikaCache = new Map<number, number>();

/** 公历 ce 年的 ขึ้น 15 ค่ำ เดือน 12（十一月前后）的日序号 */
function kattikaFullMoon(ce: number): number {
  const cached = kattikaCache.get(ce);
  if (cached !== undefined) return cached;
  let day = KATTIKA_ANCHOR.day;
  if (ce >= KATTIKA_ANCHOR.year) {
    for (let y = KATTIKA_ANCHOR.year + 1; y <= ce; y++) day += yearLength(y);
  } else {
    for (let y = KATTIKA_ANCHOR.year; y > ce; y--) day -= yearLength(y);
  }
  kattikaCache.set(ce, day);
  return day;
}

interface MonthSpan {
  month: number;
  /** เดือน 8 หลัง */
  second: boolean;
  length: number;
}

/** 从 เดือนอ้าย（1 月）到 เดือน 12 的月份序列，年型取 ce 年 */
function monthsOf(ce: number): MonthSpan[] {
  const type = thaiLunarYearType(ce);
  const months: MonthSpan[] = [];
  for (let m = 1; m <= 12; m++) {
    let length = m % 2 === 1 ? 29 : 30;
    if (m === 7 && type === 'athikawan') length = 30;
    months.push({ month: m, second: false, length });
    if (m === 8 && type === 'athikamat') months.push({ month: 8, second: true, length: 30 });
  }
  return months;
}

export interface ThaiLunarDate {
  /** 阴历月份 1–12（1 = เดือนอ้าย，2 = เดือนยี่） */
  month: number;
  /** 是否为 เดือน 8 หลัง（闰月年第二个八月） */
  secondEighth: boolean;
  /** true = ข้างขึ้น（上弦），false = ข้างแรม（下弦） */
  waxing: boolean;
  /** 几 ค่ำ（1–15） */
  day: number;
  /** 本月天数（29 或 30） */
  monthLength: number;
  /** 是否为 วันพระ：ขึ้น 8、ขึ้น 15、แรม 8 和每月最后一天（แรม 14 或 15） */
  holyDay: boolean;
  /** 本阴历年的年型 */
  yearType: ThaiLunarYearType;
}

/** 公历日期 → 泰国阴历（支持 1902–2098 年） */
export function thaiLunarDate(year: number, month: number, day: number): ThaiLunarDate {
  if (year < 1902 || year > 2098) throw new RangeError('泰国阴历换算支持 1902–2098 年');
  const n = dayNumber(year, month, day);
  // 找到 n 之前（含当天）最近的 ขึ้น 15 ค่ำ เดือน 12
  let kYear = year - 1;
  if (n >= kattikaFullMoon(year)) kYear = year;
  const k = kattikaFullMoon(kYear);
  const offset = n - k;
  const nextType = thaiLunarYearType(kYear + 1);

  // 上一个十二月的满月及其后 15 天（แรม 1–15）
  if (offset <= 15) {
    const waxing = offset === 0;
    const d = waxing ? 15 : offset;
    return { month: 12, secondEighth: false, waxing, day: d, monthLength: 30, holyDay: d === 15 || d === 8, yearType: thaiLunarYearType(kYear) };
  }

  let rest = offset - 16; // 0 = ขึ้น 1 ค่ำ เดือนอ้าย
  for (const span of monthsOf(kYear + 1)) {
    if (rest < span.length) {
      const waxing = rest < 15;
      const d = waxing ? rest + 1 : rest - 14;
      const last = rest === span.length - 1;
      return {
        month: span.month,
        secondEighth: span.second,
        waxing,
        day: d,
        monthLength: span.length,
        holyDay: d === 8 || (waxing && d === 15) || (!waxing && last),
        yearType: nextType,
      };
    }
    rest -= span.length;
  }
  throw new Error('unreachable');
}

/** 泰文写法，例如“ขึ้น 15 ค่ำ เดือน 12”“แรม 8 ค่ำ เดือน 8 หลัง”“ขึ้น 8 ค่ำ เดือนอ้าย” */
export function formatThaiLunar(d: Pick<ThaiLunarDate, 'month' | 'secondEighth' | 'waxing' | 'day'>): string {
  const month = d.month === 1 ? 'อ้าย' : d.month === 2 ? 'ยี่' : String(d.month);
  return `${d.waxing ? 'ขึ้น' : 'แรม'} ${d.day} ค่ำ เดือน${d.month <= 2 ? '' : ' '}${month}${d.secondEighth ? ' หลัง' : ''}`;
}

// ---------------------------------------------------------------------------
// กาลโยค：每年的 วันธงชัย、วันอธิบดี、วันอุบาทว์、วันโลกาวินาศ（各为一个星期几）
// 公式（Thai Wikipedia “กาลโยค”）：ธงชัย = (จ.ศ.×10+3) mod 7；อธิบดี = (จ.ศ. mod 498) mod 7；
// อุบาทว์ = (จ.ศ.×10+2) mod 7；โลกาวินาศ = (จ.ศ.+1120) mod 7；余数 1 = 星期日 … 0 = 星期六。
// จ.ศ. 在每年 4 月 16 日（วันเถลิงศก）换年。已用 2565–2569 年公开历书核对。
// ---------------------------------------------------------------------------

export interface KalaYok {
  /** จุลศักราช */
  cs: number;
  /** 0 = 星期日 … 6 = 星期六 */
  thongchai: number;
  athibodi: number;
  ubat: number;
  lokawinat: number;
}

const toJsWeekday = (v: number) => (((v % 7) + 6) % 7);

export function kalaYok(year: number, month: number, day: number): KalaYok {
  const beforeNewYear = month < 4 || (month === 4 && day < 16);
  const cs = year - 638 - (beforeNewYear ? 1 : 0);
  return {
    cs,
    thongchai: toJsWeekday(cs * 10 + 3),
    athibodi: toJsWeekday(cs % 498),
    ubat: toJsWeekday(cs * 10 + 2),
    lokawinat: toJsWeekday(cs + 1120),
  };
}

export type AuspiciousDay = 'thongchai' | 'athibodi' | 'ubat' | 'lokawinat';

/** 某一天属于哪些吉凶日 */
export function auspiciousDaysOf(year: number, month: number, day: number): AuspiciousDay[] {
  const k = kalaYok(year, month, day);
  const wd = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (['thongchai', 'athibodi', 'ubat', 'lokawinat'] as const).filter((key) => k[key] === wd);
}
