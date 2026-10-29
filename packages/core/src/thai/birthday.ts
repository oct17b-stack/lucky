/**
 * 泰式生日星期（ดวงวันเกิด）：8 类，星期三分白天和夜晚（夜晚归罗睺 ราหู）。
 *
 * 规则表状态：待泰国命理顾问审校（RULES_STATUS）。颜色、佛像等以泰国常见说法为初稿，
 * 上线前须逐条确认，并在页面上注明依据。
 */
import type { LocalDateTime } from '../time.ts';

export const BIRTHDAY_RULES_STATUS = 'draft-pending-consultant-review' as const;

export type ThaiBirthDayKey = 'sun' | 'mon' | 'tue' | 'wed-day' | 'wed-night' | 'thu' | 'fri' | 'sat';

export interface ThaiBirthDayInfo {
  key: ThaiBirthDayKey;
  /** 泰式九曜编号：1 日 2 月 3 火 4 水 5 木 6 金 7 土 8 罗睺 */
  planetNumber: number;
  name: { th: string; 'zh-hans': string; 'zh-hant': string; en: string };
  /** 生日星期的代表色 */
  color: { th: string; en: string; hex: string };
  /** 守护佛像（พระประจำวันเกิด） */
  buddha: { th: string };
}

export const THAI_BIRTH_DAYS: readonly ThaiBirthDayInfo[] = [
  {
    key: 'sun',
    planetNumber: 1,
    name: { th: 'วันอาทิตย์', 'zh-hans': '星期日', 'zh-hant': '星期日', en: 'Sunday' },
    color: { th: 'สีแดง', en: 'Red', hex: '#d32f2f' },
    buddha: { th: 'ปางถวายเนตร' },
  },
  {
    key: 'mon',
    planetNumber: 2,
    name: { th: 'วันจันทร์', 'zh-hans': '星期一', 'zh-hant': '星期一', en: 'Monday' },
    color: { th: 'สีเหลือง', en: 'Yellow', hex: '#f9c80e' },
    buddha: { th: 'ปางห้ามญาติ' },
  },
  {
    key: 'tue',
    planetNumber: 3,
    name: { th: 'วันอังคาร', 'zh-hans': '星期二', 'zh-hant': '星期二', en: 'Tuesday' },
    color: { th: 'สีชมพู', en: 'Pink', hex: '#ec6fa4' },
    buddha: { th: 'ปางไสยาสน์' },
  },
  {
    key: 'wed-day',
    planetNumber: 4,
    name: { th: 'วันพุธกลางวัน', 'zh-hans': '星期三（白天）', 'zh-hant': '星期三（白天）', en: 'Wednesday (day)' },
    color: { th: 'สีเขียว', en: 'Green', hex: '#2e9e4f' },
    buddha: { th: 'ปางอุ้มบาตร' },
  },
  {
    key: 'wed-night',
    planetNumber: 8,
    name: { th: 'วันพุธกลางคืน', 'zh-hans': '星期三（夜晚）', 'zh-hant': '星期三（夜晚）', en: 'Wednesday (night)' },
    color: { th: 'สีเทา', en: 'Grey', hex: '#6b6b6b' },
    buddha: { th: 'ปางป่าเลไลยก์' },
  },
  {
    key: 'thu',
    planetNumber: 5,
    name: { th: 'วันพฤหัสบดี', 'zh-hans': '星期四', 'zh-hant': '星期四', en: 'Thursday' },
    color: { th: 'สีส้ม', en: 'Orange', hex: '#f08a24' },
    buddha: { th: 'ปางสมาธิ' },
  },
  {
    key: 'fri',
    planetNumber: 6,
    name: { th: 'วันศุกร์', 'zh-hans': '星期五', 'zh-hant': '星期五', en: 'Friday' },
    color: { th: 'สีฟ้า', en: 'Light blue', hex: '#4aa3df' },
    buddha: { th: 'ปางรำพึง' },
  },
  {
    key: 'sat',
    planetNumber: 7,
    name: { th: 'วันเสาร์', 'zh-hans': '星期六', 'zh-hant': '星期六', en: 'Saturday' },
    color: { th: 'สีม่วง', en: 'Purple', hex: '#7e4fb3' },
    buddha: { th: 'ปางนาคปรก' },
  },
];

export interface ThaiBirthDayOptions {
  /**
   * 泰国传统以日出（约 06:00）为一天的开始：凌晨 00:00–05:59 出生算前一天。
   * 默认 true；设为 false 则按午夜换日。
   */
  dayStartsAtSunrise: boolean;
  /** 星期三夜晚的开始时刻（小时），默认 18 */
  wednesdayNightStartsAt: number;
}

export const DEFAULT_THAI_BIRTHDAY_OPTIONS: ThaiBirthDayOptions = {
  dayStartsAtSunrise: true,
  wednesdayNightStartsAt: 18,
};

const WEEKDAY_KEYS: readonly ThaiBirthDayKey[] = ['sun', 'mon', 'tue', 'wed-day', 'thu', 'fri', 'sat'];

/** 由出生地钟表时间求泰式生日星期 */
export function thaiBirthDay(birth: LocalDateTime, opts: Partial<ThaiBirthDayOptions> = {}): ThaiBirthDayInfo {
  const o = { ...DEFAULT_THAI_BIRTHDAY_OPTIONS, ...opts };
  const beforeSunrise = o.dayStartsAtSunrise && birth.hour < 6;
  const weekday = new Date(Date.UTC(birth.year, birth.month - 1, birth.day - (beforeSunrise ? 1 : 0))).getUTCDay();
  let key = WEEKDAY_KEYS[weekday]!;
  if (weekday === 3 && (beforeSunrise || birth.hour >= o.wednesdayNightStartsAt)) key = 'wed-night';
  return THAI_BIRTH_DAYS.find((d) => d.key === key)!;
}

export function thaiBirthDayByKey(key: ThaiBirthDayKey): ThaiBirthDayInfo {
  const info = THAI_BIRTH_DAYS.find((d) => d.key === key);
  if (!info) throw new Error(`未知的生日星期：${key}`);
  return info;
}

/** 公历年 → 佛历年（พ.ศ.） */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}
