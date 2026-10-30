import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeThaiMobile, normalizeThaiMobile, thaiBirthDay, toBuddhistYear, type PhoneRuleSet } from '../src/index.ts';

test('生日星期：星期三分白天和夜晚', () => {
  // 2024-10-30 是星期三
  assert.equal(thaiBirthDay({ year: 2024, month: 10, day: 30, hour: 10, minute: 0 }).key, 'wed-day');
  assert.equal(thaiBirthDay({ year: 2024, month: 10, day: 30, hour: 19, minute: 0 }).key, 'wed-night');
  assert.equal(thaiBirthDay({ year: 2024, month: 10, day: 27, hour: 12, minute: 0 }).key, 'sun');
});

test('日出前出生按前一天算（可关闭）', () => {
  const thuEarly = { year: 2024, month: 10, day: 31, hour: 3, minute: 0 };
  assert.equal(thaiBirthDay(thuEarly).key, 'wed-night');
  assert.equal(thaiBirthDay(thuEarly, { dayStartsAtSunrise: false }).key, 'thu');
  const monEarly = { year: 2024, month: 10, day: 28, hour: 5, minute: 30 };
  assert.equal(thaiBirthDay(monEarly).key, 'sun');
});

test('佛历', () => {
  assert.equal(toBuddhistYear(2026), 2569);
});

test('手机号标准化', () => {
  assert.equal(normalizeThaiMobile('+66 81-234-5678'), '0812345678');
  assert.equal(normalizeThaiMobile('081 234 5678'), '0812345678');
  assert.equal(normalizeThaiMobile('02-123-4567'), null);
  assert.equal(normalizeThaiMobile('0812345'), null);
});

test('手机号分析：后 7 位的 6 个数字对，最后一对加倍计分', () => {
  // 示例规则，仅用于测试
  const good = { tone: 'good' as const, topics: ['money' as const], meaning: {} };
  const bad = { tone: 'bad' as const, topics: ['stress' as const], meaning: {} };
  const sample: PhoneRuleSet = {
    id: 'test-sample',
    pairs: { '24': good, '42': good, '45': good, '56': good, '78': bad },
    sums: { '44': { tone: 'good', topics: [], meaning: {} } },
  };
  const r = analyzeThaiMobile('0812345678', sample);
  assert.equal(r.sum, 44);
  assert.deepEqual(r.pairs.map((p) => p.pair), ['23', '34', '45', '56', '67', '78']);
  assert.equal(r.pairs.at(-1)!.last, true);
  assert.deepEqual(r.score, { good: 2, bad: 1, mixed: 0, unknown: 3 });
  // 2 好 − 最后一对坏 ×2 + 总和好 1 = 1 → fair；最后一对坏
  assert.equal(r.verdict, 'fair');
  assert.deepEqual(r.warnings, ['last-pair-bad']);
  assert.deepEqual(r.strengths, ['money']);
  assert.throws(() => analyzeThaiMobile('021234567'));
});

test('69/96 不宜放在最后一对', () => {
  assert.deepEqual(analyzeThaiMobile('0812345696').warnings, ['last-pair-69']);
});
