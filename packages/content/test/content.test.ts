import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALES, format, getMessages, negotiateLocale } from '../src/index.ts';

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

test('四种语言的文案键完全一致，且没有空字符串', () => {
  const base = keyPaths(getMessages('zh-hans')).sort();
  for (const locale of LOCALES) {
    const m = getMessages(locale);
    assert.deepEqual(keyPaths(m).sort(), base, locale);
    for (const path of base) {
      const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], m);
      assert.ok(typeof value === 'string' && value.length > 0, `${locale}: ${path} 为空`);
    }
  }
});

test('浏览器语言协商', () => {
  assert.equal(negotiateLocale('th-TH,th;q=0.9,en;q=0.8'), 'th');
  assert.equal(negotiateLocale('zh-TW,zh;q=0.9'), 'zh-hant');
  assert.equal(negotiateLocale('zh-CN,zh;q=0.9'), 'zh-hans');
  assert.equal(negotiateLocale('en-US,en;q=0.9'), 'en');
  assert.equal(negotiateLocale('fr-FR'), 'th');
  assert.equal(negotiateLocale(null), 'th');
});

test('插值', () => {
  assert.equal(format('起运：{years} 岁 {months} 个月', { years: 3, months: 4 }), '起运：3 岁 4 个月');
});
