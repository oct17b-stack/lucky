/**
 * 泰式手机号分析（เบอร์มงคล）。
 *
 * 读法采用泰国多数来源的通行做法（Sanook/อ.ปอ、aduang、Shopee、nanitalk、sim789 等）：
 * - 只看后 7 位（去掉开头的 0 和运营商号段两位），相邻两位一组，共 6 对
 * - 数字对正反读含义相同（24 与 42 同义）
 * - 最后一对影响最大；69/96 不宜放在最后（อ.ปอ）
 * - 总和为全部 10 位数字之和
 * 含义规则表（PhoneRuleSet）作为数据单独维护，见 @lucky/content 的 rules/numbers.ts。
 */

export type Tone = 'good' | 'bad' | 'mixed';
export type Topic = 'money' | 'work' | 'love' | 'health' | 'luck' | 'speech' | 'wisdom' | 'patron' | 'stress';

export interface PairRule {
  tone: Tone;
  topics: Topic[];
  meaning: Partial<Record<'th' | 'zh-hans' | 'zh-hant' | 'en', string>>;
}

export interface PhoneRuleSet {
  id: string;
  /** 数字对规则，键为两位数字；正反两种顺序都要登记 */
  pairs: Record<string, PairRule>;
  /** 总和规则，键为总和数字 */
  sums: Record<string, PairRule>;
}

export const EMPTY_RULESET: PhoneRuleSet = { id: 'empty', pairs: {}, sums: {} };

export type PhoneVerdict = 'great' | 'good' | 'fair' | 'poor';

export interface PhoneAnalysis {
  /** 标准化后的 10 位号码，例如 0812345678 */
  normalized: string;
  sum: number;
  sumRule: PairRule | null;
  /** 后 7 位的 6 个数字对；last = 最后一对 */
  pairs: { pair: string; position: number; last: boolean; rule: PairRule | null }[];
  score: { good: number; bad: number; mixed: number; unknown: number };
  /** 综合评价（本站规则，见 phoneVerdict） */
  verdict: PhoneVerdict;
  /** 主要优势（好数字对涉及最多的主题，最多 3 个） */
  strengths: Topic[];
  warnings: ('last-pair-bad' | 'last-pair-69')[];
  ruleSetId: string;
}

/** 把 +66 81-234-5678、081 234 5678 等格式统一为 0812345678；不是泰国手机号返回 null */
export function normalizeThaiMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('66') && digits.length === 11) digits = '0' + digits.slice(2);
  if (!/^0[689]\d{8}$/.test(digits)) return null;
  return digits;
}

/**
 * 综合评价（本站的计分约定，结果页会说明）：
 * 每个好数字对 +1、坏数字对 −1，最后一对计两倍；总和为好 +1、为坏 −1。
 * 得分 ≥ 4 且最后一对不坏 → great；≥ 2 → good；≥ 0 → fair；其余 → poor。
 * 最后一对为坏时，最高只评 fair。
 */
export function phoneVerdict(points: number, lastPairBad: boolean): PhoneVerdict {
  let v: PhoneVerdict = points >= 4 ? 'great' : points >= 2 ? 'good' : points >= 0 ? 'fair' : 'poor';
  if (lastPairBad && (v === 'great' || v === 'good')) v = 'fair';
  return v;
}

const toneValue = (t: Tone | undefined) => (t === 'good' ? 1 : t === 'bad' ? -1 : 0);

export function analyzeThaiMobile(input: string, rules: PhoneRuleSet = EMPTY_RULESET): PhoneAnalysis {
  const normalized = normalizeThaiMobile(input);
  if (!normalized) throw new RangeError('不是有效的泰国手机号（应为 06/08/09 开头的 10 位号码）');
  const digits = [...normalized].map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);

  const pairs: PhoneAnalysis['pairs'] = [];
  for (let i = 3; i < 9; i++) {
    const pair = normalized.slice(i, i + 2);
    pairs.push({ pair, position: i, last: i === 8, rule: rules.pairs[pair] ?? null });
  }

  const score = { good: 0, bad: 0, mixed: 0, unknown: 0 };
  let points = 0;
  for (const p of pairs) {
    if (p.rule) score[p.rule.tone] += 1;
    else score.unknown += 1;
    points += toneValue(p.rule?.tone) * (p.last ? 2 : 1);
  }
  const sumRule = rules.sums[String(sum)] ?? null;
  points += toneValue(sumRule?.tone);

  const last = pairs[pairs.length - 1]!;
  const warnings: PhoneAnalysis['warnings'] = [];
  if (last.rule?.tone === 'bad') warnings.push('last-pair-bad');
  if (last.pair === '69' || last.pair === '96') warnings.push('last-pair-69');

  const topicCount = new Map<Topic, number>();
  for (const p of pairs) {
    if (p.rule?.tone !== 'good') continue;
    for (const t of p.rule.topics) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
  }
  const strengths = [...topicCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  return {
    normalized,
    sum,
    sumRule,
    pairs,
    score,
    verdict: phoneVerdict(points, last.rule?.tone === 'bad'),
    strengths,
    warnings,
    ruleSetId: rules.id,
  };
}
