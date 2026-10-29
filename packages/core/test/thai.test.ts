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

test('手机号分析：总和与 8 个数字对', () => {
  // 示例规则，仅用于测试，不代表真实含义
  const sample: PhoneRuleSet = {
    id: 'test-sample',
    pairs: { '23': { tone: 'good', topics: ['money'], meaning: {} }, '45': { tone: 'bad', topics: ['health'], meaning: {} } },
    sums: { '44': { tone: 'neutral', topics: [], meaning: {} } },
  };
  const r = analyzeThaiMobile('0812345678', sample);
  assert.equal(r.sum, 44);
  assert.deepEqual(r.pairs.map((p) => p.pair), ['81', '12', '23', '34', '45', '56', '67', '78']);
  assert.deepEqual(r.score, { good: 1, bad: 1, neutral: 0, unknown: 6 });
  assert.equal(r.sumRule?.tone, 'neutral');
  assert.throws(() => analyzeThaiMobile('021234567'));
});
