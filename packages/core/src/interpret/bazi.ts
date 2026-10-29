/**
 * 八字基础解读规则引擎 v0（简化扶抑法）。
 *
 * 只输出带编号的结论和参数，不输出文字；文字由 @lucky/content 的规则库按语言提供。
 * 评分规则全部写在这里，结果页会注明规则版本，便于用户核对、顾问校准。
 *
 * 评分：
 * - 年、月、时三个天干各 1 分（日干是日主本身，不计）
 * - 每个地支 1 分，按藏干分配：1 个藏干 1.0；2 个 0.7/0.3；3 个 0.6/0.3/0.1
 * - 月支（月令）权重加倍，计 2 分
 * - 帮身 = 与日主同五行（比劫）+ 生日主的五行（印）
 * - 帮身占比 ≥ 0.6 为身强，≤ 0.4 为身弱，其间为中和
 * 喜用：身强取食伤、财、官杀（泄、耗、克）；身弱取印、比劫（生、扶）；中和取得分最低的五行。
 */
import { BRANCHES, HIDDEN_STEMS, STEMS, mod, stemElement, type ElementIndex } from '../ganzhi.ts';
import type { BaziResult } from '../bazi.ts';

export const BAZI_RULES_VERSION = 'v0-fuyi-simplified';

export type TenGodGroup = 'peer' | 'output' | 'wealth' | 'authority' | 'resource';
export const TEN_GOD_GROUPS: readonly TenGodGroup[] = ['peer', 'output', 'wealth', 'authority', 'resource'];

export type StrengthLevel = 'strong' | 'balanced' | 'weak';

export type BaziConclusion =
  | { code: 'strength'; level: StrengthLevel; ratio: number }
  | { code: 'favorable'; elements: ElementIndex[] }
  | { code: 'dominant-group'; group: TenGodGroup }
  | { code: 'missing-element'; element: ElementIndex }
  | { code: 'day-master'; element: ElementIndex; yang: boolean };

export interface BaziReading {
  rulesVersion: string;
  dayMasterElement: ElementIndex;
  /** 五行得分（含藏干与月令加权） */
  elementScores: Record<ElementIndex, number>;
  groupScores: Record<TenGodGroup, number>;
  strength: { level: StrengthLevel; ratio: number };
  favorable: ElementIndex[];
  conclusions: BaziConclusion[];
}

const HIDDEN_WEIGHTS: Record<number, number[]> = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };

/** 五行 e 相对日主五行 dm 的十神类别 */
export function groupOf(dm: ElementIndex, e: ElementIndex): TenGodGroup {
  return (['peer', 'output', 'wealth', 'authority', 'resource'] as const)[mod(e - dm, 5)]!;
}

/** 由日主五行和类别反推五行 */
export function elementOfGroup(dm: ElementIndex, group: TenGodGroup): ElementIndex {
  return mod(dm + TEN_GOD_GROUPS.indexOf(group), 5) as ElementIndex;
}

export function interpretBazi(chart: BaziResult): BaziReading {
  const stemIdx = (ch: string) => STEMS.indexOf(ch as (typeof STEMS)[number]);
  const branchIdx = (ch: string) => BRANCHES.indexOf(ch as (typeof BRANCHES)[number]);
  const p = chart.pillars;
  const dm = stemElement(stemIdx(p.day.stem));

  const scores: Record<ElementIndex, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const pillar of [p.year, p.month, p.hour]) scores[stemElement(stemIdx(pillar.stem))] += 1;
  for (const [pillar, weight] of [
    [p.year, 1],
    [p.month, 2],
    [p.day, 1],
    [p.hour, 1],
  ] as const) {
    const hidden = HIDDEN_STEMS[branchIdx(pillar.branch)]!;
    const ws = HIDDEN_WEIGHTS[hidden.length]!;
    hidden.forEach((s, i) => (scores[stemElement(s)] += ws[i]! * weight));
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const groupScores = Object.fromEntries(TEN_GOD_GROUPS.map((g) => [g, 0])) as Record<TenGodGroup, number>;
  for (const e of [0, 1, 2, 3, 4] as ElementIndex[]) groupScores[groupOf(dm, e)] += scores[e];

  const ratio = round2((groupScores.peer + groupScores.resource) / total);
  const level: StrengthLevel = ratio >= 0.6 ? 'strong' : ratio <= 0.4 ? 'weak' : 'balanced';

  let favorable: ElementIndex[];
  if (level === 'strong') favorable = (['output', 'wealth', 'authority'] as const).map((g) => elementOfGroup(dm, g));
  else if (level === 'weak') favorable = (['resource', 'peer'] as const).map((g) => elementOfGroup(dm, g));
  else {
    const min = Math.min(...Object.values(scores));
    favorable = ([0, 1, 2, 3, 4] as ElementIndex[]).filter((e) => scores[e] === min);
  }

  const dominant = TEN_GOD_GROUPS.reduce((a, b) => (groupScores[b] > groupScores[a] ? b : a));

  const conclusions: BaziConclusion[] = [
    { code: 'day-master', element: dm, yang: chart.dayMaster.yang },
    { code: 'strength', level, ratio },
    { code: 'favorable', elements: favorable },
    { code: 'dominant-group', group: dominant },
  ];
  const ELEMENT_CHARS = ['木', '火', '土', '金', '水'];
  for (const e of [0, 1, 2, 3, 4] as ElementIndex[]) {
    if ((chart.elementCount[ELEMENT_CHARS[e]!] ?? 0) === 0) conclusions.push({ code: 'missing-element', element: e });
  }

  return {
    rulesVersion: BAZI_RULES_VERSION,
    dayMasterElement: dm,
    elementScores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, round2(v)])) as Record<ElementIndex, number>,
    groupScores: Object.fromEntries(Object.entries(groupScores).map(([k, v]) => [k, round2(v)])) as Record<TenGodGroup, number>,
    strength: { level, ratio },
    favorable,
    conclusions,
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
