import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeBazi, elementOfGroup, groupOf, interpretBazi } from '../src/index.ts';

const chart2000 = computeBazi({
  birth: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
  timeZone: 'Asia/Shanghai',
  longitude: 116.4,
  gender: 'male',
  options: { trueSolarTime: false },
});

test('十神类别与五行互推', () => {
  // 日主木：木=比劫 火=食伤 土=财 金=官杀 水=印
  assert.deepEqual([0, 1, 2, 3, 4].map((e) => groupOf(0, e as 0)), ['peer', 'output', 'wealth', 'authority', 'resource']);
  for (const dm of [0, 1, 2, 3, 4] as const) {
    for (const g of ['peer', 'output', 'wealth', 'authority', 'resource'] as const) assert.equal(groupOf(dm, elementOfGroup(dm, g)), g);
  }
});

test('己卯 丙子 戊午 戊午：手算核对评分', () => {
  // 天干：己(土)1 丙(火)1 戊(土)1
  // 地支：卯→乙(木)1；子→癸(水)1×2；午→丁0.7 己0.3；午→丁0.7 己0.3
  // 木 1，火 1+1.4=2.4，土 2+0.6=2.6，金 0，水 2；合计 8
  const r = interpretBazi(chart2000);
  assert.deepEqual(r.elementScores, { 0: 1, 1: 2.4, 2: 2.6, 3: 0, 4: 2 });
  // 日主戊土：帮身 = 土(比劫) 2.6 + 火(印) 2.4 = 5.0 / 8 = 0.63 → 身强
  assert.equal(r.strength.ratio, 0.63);
  assert.equal(r.strength.level, 'strong');
  // 身强喜 食伤(金)、财(水)、官杀(木)
  assert.deepEqual(r.favorable, [3, 4, 0]);
  assert.ok(r.conclusions.some((c) => c.code === 'missing-element' && c.element === 3), '缺金');
});

test('总分恒为 8，结论一定包含日主、强弱、喜用、主导十神', () => {
  for (let m = 1; m <= 12; m++) {
    const r = interpretBazi(
      computeBazi({ birth: { year: 1985, month: m, day: 8, hour: 7, minute: 0 }, timeZone: 'Asia/Bangkok', longitude: 100.5, gender: 'female' }),
    );
    const total = Object.values(r.elementScores).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 8) < 0.05, `总分 ${total}`);
    for (const code of ['day-master', 'strength', 'favorable', 'dominant-group']) {
      assert.ok(r.conclusions.some((c) => c.code === code), code);
    }
  }
});
