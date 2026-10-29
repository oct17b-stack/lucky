import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SOLAR_TERMS,
  equationOfTimeMinutes,
  julianDayFromMs,
  meeusLowPrecisionSun,
  solarTermUtc,
  solarTermsOfYear,
  sunLongitudeProviderName,
  type SolarTermName,
} from '../src/index.ts';

/**
 * 公开发布的分点、至点和立春时刻（UTC，精确到分钟）。
 * 分至点来自各年公布的天文年历；立春来自中国官方公布的北京时间（已换算为 UTC）。
 */
const REFERENCE: { year: number; term: SolarTermName; utc: string }[] = [
  { year: 2023, term: '春分', utc: '2023-03-20T21:24Z' },
  { year: 2023, term: '夏至', utc: '2023-06-21T14:57Z' },
  { year: 2023, term: '秋分', utc: '2023-09-23T06:50Z' },
  { year: 2023, term: '冬至', utc: '2023-12-22T03:27Z' },
  { year: 2024, term: '立春', utc: '2024-02-04T08:27Z' },
  { year: 2024, term: '春分', utc: '2024-03-20T03:06Z' },
  { year: 2024, term: '夏至', utc: '2024-06-20T20:51Z' },
  { year: 2024, term: '秋分', utc: '2024-09-22T12:44Z' },
  { year: 2024, term: '冬至', utc: '2024-12-21T09:21Z' },
  { year: 2025, term: '立春', utc: '2025-02-03T14:10Z' },
  { year: 2025, term: '春分', utc: '2025-03-20T09:01Z' },
  { year: 2025, term: '夏至', utc: '2025-06-21T02:42Z' },
  { year: 2025, term: '秋分', utc: '2025-09-22T18:19Z' },
  { year: 2025, term: '冬至', utc: '2025-12-21T15:03Z' },
];

/** 阶段 0 验收门槛：与公布值相差不超过 1 分钟（参考值本身四舍五入到分钟） */
const TOLERANCE_MINUTES = 1;

test('默认使用高精度模型', () => {
  assert.equal(sunLongitudeProviderName(), 'astronomy-engine');
});

test('节气时刻与公布值相差不超过 1 分钟', () => {
  const report: string[] = [];
  for (const ref of REFERENCE) {
    const diffMin = (solarTermUtc(ref.year, ref.term) - Date.parse(ref.utc)) / 60_000;
    report.push(`${ref.year}${ref.term} ${diffMin >= 0 ? '+' : ''}${diffMin.toFixed(2)}`);
    assert.ok(Math.abs(diffMin) <= TOLERANCE_MINUTES, `${ref.year} ${ref.term} 误差 ${diffMin.toFixed(2)} 分钟`);
  }
  console.log('节气误差（分钟）：' + report.join('，'));
});

test('交叉校验：1900–2100 年与独立的 Meeus 模型相差不超过 15 分钟', () => {
  let worst = 0;
  for (let year = 1900; year <= 2100; year += 7) {
    for (const t of SOLAR_TERMS) {
      const a = solarTermUtc(year, t.name);
      const b = solarTermUtc(year, t.name, meeusLowPrecisionSun);
      worst = Math.max(worst, Math.abs(a - b) / 60_000);
    }
  }
  console.log(`与 Meeus 模型的最大差异：${worst.toFixed(1)} 分钟`);
  assert.ok(worst < 15, `最大差异 ${worst.toFixed(1)} 分钟`);
});

test('1900–2100 年每年立春都在北京时间 2 月 3–5 日', () => {
  for (let year = 1900; year <= 2100; year++) {
    const beijing = new Date(solarTermUtc(year, '立春') + 8 * 3_600_000);
    assert.equal(beijing.getUTCMonth(), 1, `${year}`);
    assert.ok([3, 4, 5].includes(beijing.getUTCDate()), `${year} 立春在 2 月 ${beijing.getUTCDate()} 日`);
  }
});

test('每年 24 个节气按时间递增，间隔 14–16.2 天', () => {
  for (const year of [1901, 1950, 1988, 2025, 2099]) {
    const terms = solarTermsOfYear(year);
    for (let i = 1; i < terms.length; i++) {
      const gapDays = (terms[i]!.utcMs - terms[i - 1]!.utcMs) / 86_400_000;
      assert.ok(gapDays > 14 && gapDays < 16.2, `${year} ${terms[i - 1]!.name}→${terms[i]!.name} 间隔 ${gapDays.toFixed(2)} 天`);
    }
  }
});

test('均时差范围：2 月中旬约 −14 分钟，11 月初约 +16 分钟', () => {
  const feb = equationOfTimeMinutes(julianDayFromMs(Date.UTC(2024, 1, 11)));
  const nov = equationOfTimeMinutes(julianDayFromMs(Date.UTC(2024, 10, 3)));
  assert.ok(feb > -15 && feb < -13, `2 月：${feb}`);
  assert.ok(nov > 15.5 && nov < 17, `11 月：${nov}`);
});
