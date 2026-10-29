import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solarTermUtc, solarTermsOfYear, equationOfTimeMinutes, julianDayFromMs, type SolarTermName } from '../src/index.ts';

/**
 * 参考值：中国官方公布的节气时刻（北京时间，已换算为 UTC）。
 * 这是金标准测试集的起点，正式版要扩充到覆盖 1900–2100 年的全部节气。
 */
const REFERENCE: { year: number; term: SolarTermName; utc: string }[] = [
  { year: 2000, term: '立春', utc: '2000-02-04T12:40Z' },
  { year: 2024, term: '立春', utc: '2024-02-04T08:27Z' },
  { year: 2024, term: '春分', utc: '2024-03-20T03:06Z' },
  { year: 2024, term: '夏至', utc: '2024-06-20T20:51Z' },
  { year: 2024, term: '冬至', utc: '2024-12-21T09:21Z' },
  { year: 2025, term: '立春', utc: '2025-02-03T14:10Z' },
  { year: 2026, term: '立春', utc: '2026-02-03T20:02Z' },
];

/**
 * 当前默认的低精度太阳模型容差。
 * 换成 astronomy-engine 或 Swiss Ephemeris 后，把它收紧到 1 分钟（阶段 0 的验收门槛）。
 */
const TOLERANCE_MINUTES = 20;

test('节气时刻与官方公布值的误差', () => {
  const errors: string[] = [];
  for (const ref of REFERENCE) {
    const got = solarTermUtc(ref.year, ref.term);
    const diffMin = (got - Date.parse(ref.utc)) / 60_000;
    errors.push(`${ref.year}${ref.term} ${diffMin >= 0 ? '+' : ''}${diffMin.toFixed(1)} 分钟`);
    assert.ok(Math.abs(diffMin) < TOLERANCE_MINUTES, `${ref.year} ${ref.term} 误差 ${diffMin.toFixed(1)} 分钟`);
  }
  console.log('节气误差：' + errors.join('，'));
});

test('一年 24 个节气按时间递增，间隔约 14–16 天', () => {
  const terms = solarTermsOfYear(2025);
  for (let i = 1; i < terms.length; i++) {
    const gapDays = (terms[i]!.utcMs - terms[i - 1]!.utcMs) / 86_400_000;
    assert.ok(gapDays > 14 && gapDays < 16.2, `${terms[i - 1]!.name}→${terms[i]!.name} 间隔 ${gapDays.toFixed(2)} 天`);
  }
});

test('均时差范围：2 月中旬约 −14 分钟，11 月初约 +16 分钟', () => {
  const feb = equationOfTimeMinutes(julianDayFromMs(Date.UTC(2024, 1, 11)));
  const nov = equationOfTimeMinutes(julianDayFromMs(Date.UTC(2024, 10, 3)));
  assert.ok(feb > -15 && feb < -13, `2 月：${feb}`);
  assert.ok(nov > 15.5 && nov < 17, `11 月：${nov}`);
});
