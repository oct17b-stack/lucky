/**
 * 配对（คู่สมพงษ์）：
 * 1. 生肖关系（地支）：六合、三合、相冲、相害，均为传统固定组合
 * 2. ทักษา：对方的生日星曜落在本人 ทักษา 的哪一宫
 */
import { mod } from './ganzhi.ts';
import { houseOfPlanet, planetOfBirthDay, type TaksaHouse } from './thai/taksa.ts';
import type { ThaiBirthDayKey } from './thai/birthday.ts';

export type ZodiacRelation = 'sixHarmony' | 'threeHarmony' | 'same' | 'clash' | 'harm' | 'neutral';

/** 六合：子丑、寅亥、卯戌、辰酉、巳申、午未（地支索引和为 1 或 13） */
function isSixHarmony(a: number, b: number): boolean {
  return mod(a + b, 12) === 1;
}

/** 三合：申子辰、亥卯未、寅午戌、巳酉丑（索引相差 4 或 8） */
function isThreeHarmony(a: number, b: number): boolean {
  return a !== b && mod(a - b, 4) === 0;
}

/** 六冲：子午、丑未、寅申、卯酉、辰戌、巳亥（索引相差 6） */
function isClash(a: number, b: number): boolean {
  return mod(a - b, 12) === 6;
}

/** 六害：子未、丑午、寅巳、卯辰、申亥、酉戌（索引和为 7 或 19） */
function isHarm(a: number, b: number): boolean {
  return mod(a + b, 12) === 7;
}

/** 两个生肖（地支索引 0=子/鼠）的关系；冲、害优先于合 */
export function zodiacRelation(a: number, b: number): ZodiacRelation {
  const x = mod(a, 12);
  const y = mod(b, 12);
  if (x === y) return 'same';
  if (isClash(x, y)) return 'clash';
  if (isHarm(x, y)) return 'harm';
  if (isSixHarmony(x, y)) return 'sixHarmony';
  if (isThreeHarmony(x, y)) return 'threeHarmony';
  return 'neutral';
}

export interface CompatibilityResult {
  zodiac: { relation: ZodiacRelation; a: number; b: number };
  /** 对方星曜落在我的哪一宫，以及我的星曜落在对方的哪一宫 */
  taksa: { partnerInMine: TaksaHouse; meInPartner: TaksaHouse };
}

export function compatibility(
  me: { zodiac: number; birthDay: ThaiBirthDayKey },
  partner: { zodiac: number; birthDay: ThaiBirthDayKey },
): CompatibilityResult {
  return {
    zodiac: { relation: zodiacRelation(me.zodiac, partner.zodiac), a: me.zodiac, b: partner.zodiac },
    taksa: {
      partnerInMine: houseOfPlanet(me.birthDay, planetOfBirthDay(partner.birthDay)),
      meInPartner: houseOfPlanet(partner.birthDay, planetOfBirthDay(me.birthDay)),
    },
  };
}
