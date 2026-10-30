/**
 * 泰式星座（ราศี）与上升星座（ลัคนา），使用恒星黄道。
 *
 * 岁差（ayanamsa）默认用 Lahiri（印度官方标准，也是泰国现代占星软件常用的值）：
 *   J2000.0 时为 23.853°，每年增加约 50.29″。
 * 泰国传统 สุริยยาตร์ 算法的岁差与此略有差异，交界日前后可能差一天，结果页会注明。
 */
import { SiderealTime } from 'astronomy-engine';
import { sunLongitudeAt, normalizeDegrees } from '../astro.ts';
import { zonedTimeToUtc, julianDayFromMs, type LocalDateTime } from '../time.ts';

export const AYANAMSA_MODEL = 'lahiri-linear' as const;

const DEG = Math.PI / 180;

/** Lahiri 岁差（度）的线性近似；1900–2100 年误差小于 0.01° */
export function lahiriAyanamsa(utcMs: number): number {
  const years = (julianDayFromMs(utcMs) - 2451545.0) / 365.25;
  return 23.853 + (50.29 / 3600) * years;
}

/** 恒星黄道经度 → 星座索引（0=เมษ/白羊） */
export function signIndexOf(siderealLongitude: number): number {
  return Math.floor(normalizeDegrees(siderealLongitude) / 30);
}

/** 太阳的恒星黄道经度 */
export function siderealSunLongitude(utcMs: number): number {
  return normalizeDegrees(sunLongitudeAt(utcMs) - lahiriAyanamsa(utcMs));
}

/** 西方（回归黄道）太阳星座索引，用于对照 */
export function tropicalSunSign(utcMs: number): number {
  return signIndexOf(sunLongitudeAt(utcMs));
}

/** 黄赤交角（度），Meeus 22.2 */
function obliquity(utcMs: number): number {
  const t = (julianDayFromMs(utcMs) - 2451545.0) / 36525;
  return 23.439291 - 0.0130042 * t;
}

/**
 * 上升点（回归黄道经度，度）。
 * 公式：λ = atan2(cos θ, −(sin θ·cos ε + tan φ·sin ε))，θ 为地方恒星时（度），φ 为纬度。
 */
export function tropicalAscendant(utcMs: number, latitude: number, longitude: number): number {
  const gst = SiderealTime(new Date(utcMs)); // 格林尼治视恒星时（小时）
  const theta = normalizeDegrees(gst * 15 + longitude) * DEG;
  const eps = obliquity(utcMs) * DEG;
  const phi = latitude * DEG;
  const asc = Math.atan2(Math.cos(theta), -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return normalizeDegrees(asc / DEG);
}

export interface ThaiZodiacResult {
  /** 太阳所在恒星星座（0=เมษ） */
  sunSign: number;
  sunLongitude: number;
  /** 西方星座，便于对照 */
  westernSign: number;
  /** 上升星座（需要出生时间） */
  ascendant: { sign: number; longitude: number } | null;
  meta: { ayanamsa: number; model: typeof AYANAMSA_MODEL };
}

export function thaiZodiac(input: {
  birth: LocalDateTime;
  timeZone: string;
  latitude: number;
  longitude: number;
  hourKnown: boolean;
}): ThaiZodiacResult {
  const birth = input.hourKnown ? input.birth : { ...input.birth, hour: 12, minute: 0 };
  const { utcMs } = zonedTimeToUtc(birth, input.timeZone);
  const sunLon = siderealSunLongitude(utcMs);
  const ayanamsa = lahiriAyanamsa(utcMs);
  let ascendant: ThaiZodiacResult['ascendant'] = null;
  if (input.hourKnown) {
    const lon = normalizeDegrees(tropicalAscendant(utcMs, input.latitude, input.longitude) - ayanamsa);
    ascendant = { sign: signIndexOf(lon), longitude: round2(lon) };
  }
  return {
    sunSign: signIndexOf(sunLon),
    sunLongitude: round2(sunLon),
    westernSign: tropicalSunSign(utcMs),
    ascendant,
    meta: { ayanamsa: round2(ayanamsa), model: AYANAMSA_MODEL },
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
