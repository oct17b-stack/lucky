import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compatibility, thaiZodiac, zodiacIndexFor, zodiacRelation } from '../src/index.ts';

test('生肖关系：六合、三合、冲、害', () => {
  // 子=0 丑=1 寅=2 卯=3 辰=4 巳=5 午=6 未=7 申=8 酉=9 戌=10 亥=11
  assert.equal(zodiacRelation(0, 1), 'sixHarmony'); // 子丑
  assert.equal(zodiacRelation(2, 11), 'sixHarmony'); // 寅亥
  assert.equal(zodiacRelation(6, 7), 'sixHarmony'); // 午未
  assert.equal(zodiacRelation(8, 0), 'threeHarmony'); // 申子
  assert.equal(zodiacRelation(3, 7), 'threeHarmony'); // 卯未
  assert.equal(zodiacRelation(0, 6), 'clash'); // 子午
  assert.equal(zodiacRelation(5, 11), 'clash'); // 巳亥
  assert.equal(zodiacRelation(0, 7), 'harm'); // 子未
  assert.equal(zodiacRelation(9, 10), 'harm'); // 酉戌
  assert.equal(zodiacRelation(4, 4), 'same');
  assert.equal(zodiacRelation(0, 2), 'neutral'); // 子寅
  // 对称
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) assert.equal(zodiacRelation(a, b), zodiacRelation(b, a));
});

test('ทักษา 配对：星期日出生的人遇到星期五出生的对象，对方落在กาลกิณี', () => {
  const r = compatibility({ zodiac: 0, birthDay: 'sun' }, { zodiac: 1, birthDay: 'fri' });
  assert.equal(r.zodiac.relation, 'sixHarmony');
  assert.equal(r.taksa.partnerInMine, 'kalakini');
});

test('生肖换年规则', () => {
  const d = { year: 2024, month: 2, day: 1 }; // 春节 2024-02-10、立春 2024-02-04 之前
  assert.equal(zodiacIndexFor(d, 'jan1'), 4); // 2024 龙
  assert.equal(zodiacIndexFor(d, 'lichun'), 3); // 仍为兔
  assert.equal(zodiacIndexFor(d, 'lunarNewYear'), 3);
  assert.equal(zodiacIndexFor(d, 'songkran'), 3);
  assert.equal(zodiacIndexFor({ year: 2024, month: 2, day: 5 }, 'lichun'), 4);
  assert.equal(zodiacIndexFor({ year: 2024, month: 2, day: 5 }, 'lunarNewYear'), 3);
  assert.equal(zodiacIndexFor({ year: 2024, month: 4, day: 13 }, 'songkran'), 4);
});

test('泰式星座：4 月 10 日是ราศีมีน，4 月 20 日是ราศีเมษ；西方星座都是白羊', () => {
  const base = { timeZone: 'Asia/Bangkok', latitude: 13.75, longitude: 100.5, hourKnown: true };
  const apr10 = thaiZodiac({ ...base, birth: { year: 2000, month: 4, day: 10, hour: 12, minute: 0 } });
  const apr20 = thaiZodiac({ ...base, birth: { year: 2000, month: 4, day: 20, hour: 12, minute: 0 } });
  assert.equal(apr10.sunSign, 11);
  assert.equal(apr20.sunSign, 0);
  assert.equal(apr10.westernSign, 0);
  assert.ok(apr10.meta.ayanamsa > 23.8 && apr10.meta.ayanamsa < 23.9);
});

test('上升星座：一天之内 12 个星座都会出现；不知道时间时不算', () => {
  const seen = new Set<number>();
  for (let h = 0; h < 24; h++) {
    const r = thaiZodiac({ birth: { year: 2000, month: 6, day: 1, hour: h, minute: 0 }, timeZone: 'Asia/Bangkok', latitude: 13.75, longitude: 100.5, hourKnown: true });
    seen.add(r.ascendant!.sign);
  }
  assert.equal(seen.size, 12);
  const unknown = thaiZodiac({ birth: { year: 2000, month: 6, day: 1, hour: 0, minute: 0 }, timeZone: 'Asia/Bangkok', latitude: 13.75, longitude: 100.5, hourKnown: false });
  assert.equal(unknown.ascendant, null);
});

test('上升点：春分日当地恒星时 0 时（赤道），上升点约为回归黄经 90°', async () => {
  const { tropicalAscendant } = await import('../src/index.ts');
  // θ=0 时公式给出 λ = atan2(1, -tanφ·sinε)，赤道上为 90°
  // 找一个格林尼治恒星时约为 0 的时刻：2000-09-21 约 00:00 UT
  const t = Date.UTC(2000, 8, 21, 0, 0);
  const asc = tropicalAscendant(t, 0, 0);
  assert.ok(Math.abs(asc - 90) < 2, `上升点 ${asc}`);
});

/**
 * 泰国网站公布的ราศี日期区间（KTC、Wongnai、Thairath 一致）：
 * เมษ 13/4、พฤษภ 15/5、เมถุน 15/6、กรกฎ 15/7、สิงห์ 16/8、กันย์ 17/9、ตุลย์ 17/10、
 * พิจิก 16/11、ธนู 16/12、มังกร 15/1、กุมภ์ 13/2、มีน 15/3。
 * 这些是简化的固定日期；按 Lahiri 实际计算，太阳入宫时刻每年浮动，
 * 且不知道出生时间时按正午判断，所以“正午已入宫的第一天”落在公布日期的 −1 到 +2 天之间。
 * （参照：泰国官方公布的 2567 年 มหาสงกรานต์ 为 4 月 13 日晚间，与 Lahiri 计算相差约 20 分钟。）
 */
test('泰式星座与公布的日期区间一致（交界 −1 到 +2 天），2000–2030 年', () => {
  const starts: [number, number, number][] = [
    [4, 13, 0], [5, 15, 1], [6, 15, 2], [7, 15, 3], [8, 16, 4], [9, 17, 5],
    [10, 17, 6], [11, 16, 7], [12, 16, 8], [1, 15, 9], [2, 13, 10], [3, 15, 11],
  ];
  for (let year = 2000; year <= 2030; year += 5) {
    for (const [month, day, sign] of starts) {
      const at = (d: number) =>
        thaiZodiac({ birth: { year, month, day: d, hour: 12, minute: 0 }, timeZone: 'Asia/Bangkok', latitude: 13.75, longitude: 100.5, hourKnown: false }).sunSign;
      assert.equal(at(day + 2), sign, `${year}-${month}-${day + 2} 应已进入`);
      assert.equal(at(day - 2), (sign + 11) % 12, `${year}-${month}-${day - 2} 应未进入`);
      // 区间中段（起始日 +10 天）一定在该星座
      assert.equal(at(Math.min(day + 10, 28)), sign, `${year}-${month} 中段`);
    }
  }
});
