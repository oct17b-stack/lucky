/**
 * 泰式手机号分析（เบอร์มงคล）：号码标准化、数字总和、相邻两位数字对（คู่เลข）。
 *
 * 数字对和总和的吉凶含义由规则表决定（PhoneRuleSet），规则表作为数据单独维护，
 * 由泰国命理顾问提供和审校。框架里不内置任何真实含义，只有测试用的示例规则。
 */

export type Tone = 'good' | 'bad' | 'neutral';
export type Topic = 'money' | 'career' | 'love' | 'health' | 'luck' | 'social';

export interface PairRule {
  tone: Tone;
  topics: Topic[];
  meaning: Partial<Record<'th' | 'zh-hans' | 'zh-hant' | 'en', string>>;
}

export interface PhoneRuleSet {
  id: string;
  /** 数字对规则，键为两位数字，例如 "24"；不区分顺序的规则可同时登记 "24" 和 "42" */
  pairs: Record<string, PairRule>;
  /** 总和规则，键为总和数字 */
  sums: Record<string, PairRule>;
}

export const EMPTY_RULESET: PhoneRuleSet = { id: 'empty', pairs: {}, sums: {} };

export interface PhoneAnalysis {
  /** 标准化后的 10 位号码，例如 0812345678 */
  normalized: string;
  sum: number;
  sumRule: PairRule | null;
  pairs: { pair: string; position: number; rule: PairRule | null }[];
  score: { good: number; bad: number; neutral: number; unknown: number };
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
 * 分析手机号。数字对从第 2 位开始取（跳过开头的 0），共 8 对。
 */
export function analyzeThaiMobile(input: string, rules: PhoneRuleSet = EMPTY_RULESET): PhoneAnalysis {
  const normalized = normalizeThaiMobile(input);
  if (!normalized) throw new RangeError('不是有效的泰国手机号（应为 06/08/09 开头的 10 位号码）');
  const digits = [...normalized].map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  const pairs = [];
  for (let i = 1; i < digits.length - 1; i++) {
    const pair = normalized.slice(i, i + 2);
    pairs.push({ pair, position: i, rule: rules.pairs[pair] ?? null });
  }
  const score = { good: 0, bad: 0, neutral: 0, unknown: 0 };
  for (const p of pairs) {
    if (p.rule) score[p.rule.tone] += 1;
    else score.unknown += 1;
  }
  return { normalized, sum, sumRule: rules.sums[String(sum)] ?? null, pairs, score, ruleSetId: rules.id };
}
