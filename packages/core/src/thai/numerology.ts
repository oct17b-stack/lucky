/**
 * เลขศาสตร์：泰文字母、元音、声调符号的数值（1–9），用于名字和车牌分析。
 *
 * 数值表采用三个泰国来源一致的版本：
 * theluckyname.com/หลักเลขศาสตร์、do-doung.net/number-science.php、blockdit（5e346c00813bf804110e51bb），
 * ฃ = 3 取自 do-doung 与 blockdit。已知差异：mamaexpert 把 ฬ、สระอึ 记为 4、สระอิ 记为 3；
 * KTC 的车牌文章把 3 和 4 对调，判断为该文错误，未采用。ฅ 各来源都没有给值，按 0 处理。
 * 总和的吉凶含义各家说法不一，等命理顾问提供规则表后再显示。
 */
import { houseOfPlanet, planetOfLetter, PLANETS, taksaChart, type Planet, type TaksaHouse } from './taksa.ts';
import type { ThaiBirthDayKey } from './birthday.ts';

export const NUMEROLOGY_TABLE_SOURCE = 'theluckyname+do-doung+blockdit' as const;

const ROWS: Record<number, string> = {
  1: 'กดทถภฤุ่าำ',
  2: 'ขชงบป้เแู',
  3: 'ฆตฑฒ๋ฃ',
  4: 'คธญรษะิโั',
  5: 'ฉณฌนมหฎฬฮึ',
  6: 'จลวอใ',
  7: 'ซศส๊ีื',
  8: 'ผฝพฟย็',
  9: 'ฏฐไ์',
};

const VALUE = new Map<string, number>();
for (const [n, chars] of Object.entries(ROWS)) for (const ch of chars) VALUE.set(ch, Number(n));

/** 单个字符的数值；不计数的字符（如 ฅ、ๅ、ๆ）返回 0 */
export function letterValue(ch: string): number {
  return VALUE.get(ch) ?? 0;
}

const THAI = /^[ก-๎]+$/;

/** 只保留泰文字符（去掉空格），非泰文返回 null */
export function normalizeThai(input: string): string | null {
  const s = input.normalize('NFC').replace(/\s+/g, '');
  if (!s || !THAI.test(s)) return null;
  return s;
}

export function numerologySum(text: string): number {
  return [...text].reduce((sum, ch) => sum + letterValue(ch), 0);
}

export interface NameAnalysis {
  name: string;
  surname: string | null;
  sums: { name: number; surname: number | null; total: number };
  /** 名字里的กาลกิณี字母 */
  kalakini: string[];
  /** 生日星期的กาลกิณี是否为元音组（星期一出生）；元音如何计入，各派说法不同 */
  kalakiniIsVowelGroup: boolean;
  /** 每个字母（声调符号等除外）落在哪一宫 */
  letters: { ch: string; planet: Planet; house: TaksaHouse; value: number }[];
}

export function analyzeThaiName(birthDay: ThaiBirthDayKey, name: string, surname?: string): NameAnalysis {
  const n = normalizeThai(name);
  if (!n) throw new RangeError('名字必须是泰文');
  const sn = surname?.trim() ? normalizeThai(surname) : null;
  if (surname?.trim() && !sn) throw new RangeError('姓氏必须是泰文');

  const kalakiniPlanet = taksaChart(birthDay).kalakini;
  const letters: NameAnalysis['letters'] = [];
  const kalakini: string[] = [];
  for (const ch of n) {
    const planet = planetOfLetter(ch);
    if (!planet) continue;
    letters.push({ ch, planet, house: houseOfPlanet(birthDay, planet), value: letterValue(ch) });
    if (planet === kalakiniPlanet && !kalakini.includes(ch)) kalakini.push(ch);
  }

  const nameSum = numerologySum(n);
  const surnameSum = sn ? numerologySum(sn) : null;
  return {
    name: n,
    surname: sn,
    sums: { name: nameSum, surname: surnameSum, total: nameSum + (surnameSum ?? 0) },
    kalakini,
    kalakiniIsVowelGroup: PLANETS[kalakiniPlanet].key === 'sun',
    letters,
  };
}

export interface PlateAnalysis {
  /** 标准化后的车牌，例如“1กข 1234” */
  plate: string;
  letters: { ch: string; value: number }[];
  digits: number[];
  sum: number;
}

/** 泰国车牌：可选的前置数字 + 1–2 个泰文辅音 + 1–4 位数字（省名不计） */
export function analyzeThaiPlate(input: string): PlateAnalysis {
  const s = input.normalize('NFC').replace(/[\s-]+/g, ' ').trim();
  const m = /^(\d?)\s?([ก-ฮ]{1,2})\s?(\d{1,4})(?:\s.*)?$/.exec(s);
  if (!m) throw new RangeError('车牌格式不正确');
  const [, prefix = '', letterPart = '', numberPart = ''] = m;
  const letters = [...letterPart].map((ch) => ({ ch, value: letterValue(ch) }));
  const digits = [...prefix, ...numberPart].map(Number);
  const sum = letters.reduce((a, l) => a + l.value, 0) + digits.reduce((a, d) => a + d, 0);
  return { plate: `${prefix}${letterPart} ${numberPart}`, letters, digits, sum };
}
