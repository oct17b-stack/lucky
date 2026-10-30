import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALES, NAME_MEANINGS, PAIR_MEANINGS, SUM_MEANINGS, readableTotal, totalMeaning } from '../src/index.ts';

test('00–99 每个数字对都有含义，且正反同义', () => {
  for (let i = 0; i < 100; i++) {
    const k = String(i).padStart(2, '0');
    const m = PAIR_MEANINGS[k];
    assert.ok(m, `缺少 ${k}`);
    assert.equal(PAIR_MEANINGS[k[1]! + k[0]!], m, `${k} 与反向不同`);
    for (const l of LOCALES) assert.ok(m.meaning[l].length > 3, `${k} ${l}`);
  }
});

test('总和 9–81 都有含义，名字表覆盖 1–8 与 82–100', () => {
  for (let n = 9; n <= 81; n++) assert.ok(SUM_MEANINGS[String(n)], `总和 ${n}`);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, ...Array.from({ length: 19 }, (_, i) => 82 + i)]) {
    assert.ok(NAME_MEANINGS[String(n)], `名字 ${n}`);
  }
});

test('吉凶与统计一致：标为 good/bad 的，该方向票数过半', () => {
  for (const table of [PAIR_MEANINGS, SUM_MEANINGS, NAME_MEANINGS]) {
    for (const [k, m] of Object.entries(table)) {
      const [g, b, , n] = m.agree.split('/').map(Number) as [number, number, number, number];
      if (m.tone === 'good') assert.ok(g * 2 > n, `${k} good ${m.agree}`);
      if (m.tone === 'bad') assert.ok(b * 2 > n, `${k} bad ${m.agree}`);
    }
  }
});

test('超过 100 的读法', () => {
  assert.equal(readableTotal(109), 19);
  assert.equal(readableTotal(101), 11);
  assert.equal(readableTotal(124), 24);
  assert.equal(readableTotal(100), 100);
  assert.equal(totalMeaning(124).meaning?.tone, 'good');
  assert.equal(totalMeaning(16).meaning?.tone, 'bad'); // 名字专用说法优先
});
