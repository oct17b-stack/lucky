/**
 * 天干地支、五行、阴阳、纳音等基础表。
 * 所有索引都从 0 开始：天干 0=甲，地支 0=子，六十甲子 0=甲子。
 */

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 五行：0 木、1 火、2 土、3 金、4 水 */
export const ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export type ElementIndex = 0 | 1 | 2 | 3 | 4;

export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const;

/** 地支本气五行 */
const BRANCH_ELEMENT: readonly ElementIndex[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

/** 地支藏干（本气在前），值为天干索引 */
export const HIDDEN_STEMS: readonly (readonly number[])[] = [
  [9], // 子：癸
  [5, 9, 7], // 丑：己 癸 辛
  [0, 2, 4], // 寅：甲 丙 戊
  [1], // 卯：乙
  [4, 1, 9], // 辰：戊 乙 癸
  [2, 4, 6], // 巳：丙 戊 庚
  [3, 5], // 午：丁 己
  [5, 3, 1], // 未：己 丁 乙
  [6, 8, 4], // 申：庚 壬 戊
  [7], // 酉：辛
  [4, 7, 3], // 戌：戊 辛 丁
  [8, 0], // 亥：壬 甲
];

/** 六十甲子纳音，每两组干支共用一个 */
const NAYIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木',
  '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const;

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export interface GanZhi {
  /** 六十甲子索引 0–59 */
  index: number;
  stem: number;
  branch: number;
  /** 例如 "甲子" */
  name: string;
}

export function ganzhiFromIndex(index: number): GanZhi {
  const i = mod(index, 60);
  const stem = i % 10;
  const branch = i % 12;
  return { index: i, stem, branch, name: STEMS[stem]! + BRANCHES[branch]! };
}

/** 由天干、地支求六十甲子索引（两者阴阳必须一致） */
export function ganzhiFromStemBranch(stem: number, branch: number): GanZhi {
  if (mod(stem, 2) !== mod(branch, 2)) {
    throw new Error(`天干 ${stem} 与地支 ${branch} 阴阳不一致，无法组成干支`);
  }
  for (let i = 0; i < 60; i++) {
    if (i % 10 === mod(stem, 10) && i % 12 === mod(branch, 12)) return ganzhiFromIndex(i);
  }
  throw new Error('unreachable');
}

export function stemElement(stem: number): ElementIndex {
  return Math.floor(mod(stem, 10) / 2) as ElementIndex;
}

export function branchElement(branch: number): ElementIndex {
  return BRANCH_ELEMENT[mod(branch, 12)]!;
}

export function isYangStem(stem: number): boolean {
  return mod(stem, 2) === 0;
}

export function nayin(gz: GanZhi): string {
  return NAYIN[Math.floor(gz.index / 2)]!;
}

export const TEN_GODS = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'] as const;
export type TenGod = (typeof TEN_GODS)[number];

/**
 * 以日主天干为准，求另一天干的十神。
 * 五行关系 d = (他 − 我) mod 5：0 同我、1 我生、2 我克、3 克我、4 生我。
 */
export function tenGod(dayMaster: number, other: number): TenGod {
  const d = mod(stemElement(other) - stemElement(dayMaster), 5);
  const samePolarity = isYangStem(dayMaster) === isYangStem(other);
  return TEN_GODS[d * 2 + (samePolarity ? 0 : 1)]!;
}
