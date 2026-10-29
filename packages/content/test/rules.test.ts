import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALES, renderBaziReading, type ConclusionLike } from '../src/index.ts';

const sample: ConclusionLike[] = [
  { code: 'missing-element', element: 3 },
  { code: 'favorable', elements: [3, 4, 0] },
  { code: 'strength', level: 'strong', ratio: 0.63 },
  { code: 'dominant-group', group: 'wealth' },
  { code: 'day-master', element: 2, yang: true },
];

test('四种语言都能渲染全部结论，且没有残留占位符', () => {
  for (const locale of LOCALES) {
    const paras = renderBaziReading(sample, locale);
    assert.equal(paras.length, 5, locale);
    for (const p of paras) {
      assert.ok(p.length > 10, `${locale}: ${p}`);
      assert.ok(!/\{\w+\}/.test(p), `${locale} 有未替换的占位符：${p}`);
    }
  }
});

test('简体中文内容与顺序', () => {
  const paras = renderBaziReading(sample, 'zh-hans');
  assert.match(paras[0]!, /^日主为阳土。/);
  assert.match(paras[1]!, /帮身占比 63%/);
  assert.match(paras[2]!, /喜用五行：金、水、木/);
  assert.match(paras[4]!, /没有金/);
});
