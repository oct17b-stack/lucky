import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyAlmanac, formatLunarChinese, lunarToSolar, lunarYearMonths, solarToLunar } from '../src/index.ts';

const iso = (d: { year: number; month: number; day: number }) =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

test('春节（正月初一）', () => {
  const springFestival: Record<number, string> = {
    1990: '1990-01-27',
    2000: '2000-02-05',
    2020: '2020-01-25',
    2023: '2023-01-22',
    2024: '2024-02-10',
    2025: '2025-01-29',
    2026: '2026-02-17',
  };
  for (const [year, date] of Object.entries(springFestival)) {
    assert.equal(iso(lunarToSolar(Number(year), 1, 1)), date, `${year} 春节`);
    const [y, m, d] = date.split('-').map(Number) as [number, number, number];
    assert.deepEqual(
      { ...solarToLunar(y, m, d), monthDays: 0 },
      { year: Number(year), month: 1, day: 1, leap: false, monthDays: 0 },
    );
  }
});

test('闰月', () => {
  const leaps: { year: number; month: number; start: string }[] = [
    { year: 2017, month: 6, start: '2017-07-23' },
    { year: 2020, month: 4, start: '2020-05-23' },
    { year: 2023, month: 2, start: '2023-03-22' },
    { year: 2025, month: 6, start: '2025-07-25' },
  ];
  for (const l of leaps) {
    const months = lunarYearMonths(l.year);
    assert.equal(months.length, 13, `${l.year} 应有 13 个月`);
    const leap = months.find((m) => m.leap);
    assert.equal(leap?.month, l.month, `${l.year} 闰月`);
    assert.equal(iso(leap!.start), l.start, `${l.year} 闰${l.month}月初一`);
  }
  assert.equal(lunarYearMonths(2024).length, 12);
});

test('中秋节（八月十五）', () => {
  assert.equal(iso(lunarToSolar(2024, 8, 15)), '2024-09-17');
  assert.equal(iso(lunarToSolar(2025, 8, 15)), '2025-10-06');
});

test('公历 → 农历 → 公历往返一致（1901–2099 抽样）', () => {
  for (let n = Date.UTC(1901, 1, 20); n < Date.UTC(2099, 11, 1); n += 37 * 86_400_000) {
    const d = new Date(n);
    const g = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    const l = solarToLunar(g.year, g.month, g.day);
    assert.ok(l.day >= 1 && l.day <= l.monthDays && (l.monthDays === 29 || l.monthDays === 30), `${iso(g)} → ${JSON.stringify(l)}`);
    assert.equal(iso(lunarToSolar(l.year, l.month, l.day, l.leap)), iso(g));
  }
});

test('每个农历年 12 或 13 个月，每月 29 或 30 天', () => {
  for (let y = 1902; y <= 2098; y += 4) {
    const months = lunarYearMonths(y);
    assert.ok(months.length === 12 || months.length === 13, `${y}`);
    for (const m of months) assert.ok(m.days === 29 || m.days === 30, `${y} ${m.month}月 ${m.days} 天`);
  }
});

test('中文写法', () => {
  assert.equal(formatLunarChinese({ month: 8, day: 15, leap: false }), '八月十五');
  assert.equal(formatLunarChinese({ month: 2, day: 1, leap: true }), '闰二月初一');
  assert.equal(formatLunarChinese({ month: 12, day: 30, leap: false }), '腊月三十');
  assert.equal(formatLunarChinese({ month: 11, day: 20, leap: false }), '冬月二十');
});

test('每日万年历', () => {
  const a = dailyAlmanac(2024, 2, 10);
  assert.equal(a.lunar.chinese, '正月初一');
  assert.equal(a.buddhistYear, 2567);
  assert.equal(a.ganzhi.year, '甲辰');
  assert.equal(a.weekday.key, 'sat');
  // 2000-01-01 戊午日，午冲子 → 冲鼠
  assert.equal(dailyAlmanac(2000, 1, 1).clashZodiacIndex, 0);
  // 2024-02-04 立春（曼谷时间 15:27）
  assert.equal(dailyAlmanac(2024, 2, 4).solarTerm?.name, '立春');
  assert.equal(dailyAlmanac(2024, 2, 5).solarTerm, null);
  assert.throws(() => dailyAlmanac(2024, 2, 30));
});
