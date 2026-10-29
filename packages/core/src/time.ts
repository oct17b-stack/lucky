/**
 * 时间换算：当地钟表时间 → UTC（含历史时区与夏令时）→ 真太阳时。
 *
 * 历史时区规则来自运行环境自带的 IANA 时区数据库（Intl API），
 * 例如 Asia/Shanghai 1986–1991 年的夏令时会被自动处理。
 */

export interface LocalDateTime {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  /** 0–23 */
  hour: number;
  minute: number;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

/** 某一 UTC 时刻在指定时区的 UTC 偏移（分钟，东正西负） */
export function timeZoneOffsetMinutes(timeZone: string, utcMs: number): number {
  const parts = formatterFor(timeZone).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  const wholeSecondUtc = Math.floor(utcMs / 1000) * 1000;
  return Math.round((asUtc - wholeSecondUtc) / MS_PER_MINUTE);
}

/**
 * 当地钟表时间 → UTC 毫秒。
 * 夏令时开始时不存在的时刻（例如拨快的那一小时）按拨快前的偏移处理；
 * 夏令时结束时重复的时刻取较早的那一次。
 */
export function zonedTimeToUtc(local: LocalDateTime, timeZone: string): { utcMs: number; offsetMinutes: number } {
  const naive = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
  const offsetA = timeZoneOffsetMinutes(timeZone, naive);
  let utcMs = naive - offsetA * MS_PER_MINUTE;
  const offsetB = timeZoneOffsetMinutes(timeZone, utcMs);
  if (offsetB !== offsetA) {
    const candidate = naive - offsetB * MS_PER_MINUTE;
    // 仅当候选时刻确实对应该偏移时才采用（处理重复时刻）
    if (timeZoneOffsetMinutes(timeZone, candidate) === offsetB) utcMs = Math.min(utcMs, candidate);
  }
  return { utcMs, offsetMinutes: timeZoneOffsetMinutes(timeZone, utcMs) };
}

/** UTC 毫秒 → 儒略日（UT） */
export function julianDayFromMs(utcMs: number): number {
  return utcMs / MS_PER_DAY + 2440587.5;
}

export function msFromJulianDay(jd: number): number {
  return (jd - 2440587.5) * MS_PER_DAY;
}

const DEG = Math.PI / 180;

/**
 * 均时差（分钟）：真太阳时 − 平太阳时。全年约 −14 到 +16 分钟。
 * 算法：Meeus《天文算法》第 28 章 Smart 公式。
 */
export function equationOfTimeMinutes(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const l0 = (280.46646 + 36000.76983 * t + 0.0003032 * t * t) * DEG;
  const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * DEG;
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const eps = (23.439291 - 0.0130042 * t) * DEG;
  const y = Math.tan(eps / 2) ** 2;
  const eRad =
    y * Math.sin(2 * l0) -
    2 * e * Math.sin(m) +
    4 * e * y * Math.sin(m) * Math.cos(2 * l0) -
    0.5 * y * y * Math.sin(4 * l0) -
    1.25 * e * e * Math.sin(2 * m);
  return (eRad / DEG) * 4;
}

/**
 * 真太阳时：返回一个“钟面”毫秒值，用 getUTC* 读取即为出生地的真太阳时。
 * 地方平太阳时 = UTC + 经度 × 4 分钟；真太阳时 = 地方平太阳时 + 均时差。
 */
export function trueSolarTimeMs(utcMs: number, longitudeDeg: number): number {
  const meanSolar = utcMs + longitudeDeg * 4 * MS_PER_MINUTE;
  return meanSolar + equationOfTimeMinutes(julianDayFromMs(utcMs)) * MS_PER_MINUTE;
}

/** 把“钟面”毫秒值拆成年月日时分 */
export function wallClockFromMs(ms: number): LocalDateTime {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/** 公历日期的儒略日数（JDN，正午为整数） */
export function julianDayNumber(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY) + 2440588;
}

export function formatWallClock(t: LocalDateTime): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.year}-${p(t.month)}-${p(t.day)} ${p(t.hour)}:${p(t.minute)}`;
}
