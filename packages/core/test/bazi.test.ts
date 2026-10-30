import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeBazi, ganzhiFromIndex, julianDayNumber, tenGod, zonedTimeToUtc, STEMS } from '../src/index.ts';

const dayGz = (y: number, m: number, d: number) => ganzhiFromIndex(julianDayNumber(y, m, d) - 2433191).name;

test('日柱锚点：1949-10-01 甲子，2000-01-01 戊午', () => {
  assert.equal(dayGz(1949, 10, 1), '甲子');
  assert.equal(dayGz(2000, 1, 1), '戊午');
  assert.equal(dayGz(1949, 11, 30), '甲子'); // 60 天后回到甲子
});

test('十神', () => {
  const jia = STEMS.indexOf('甲');
  assert.equal(tenGod(jia, STEMS.indexOf('甲')), '比肩');
  assert.equal(tenGod(jia, STEMS.indexOf('乙')), '劫财');
  assert.equal(tenGod(jia, STEMS.indexOf('丙')), '食神');
  assert.equal(tenGod(jia, STEMS.indexOf('戊')), '偏财');
  assert.equal(tenGod(jia, STEMS.indexOf('辛')), '正官');
  assert.equal(tenGod(jia, STEMS.indexOf('庚')), '七杀');
  assert.equal(tenGod(jia, STEMS.indexOf('癸')), '正印');
});

test('2000-01-01 12:00 北京（钟表时间）：己卯 丙子 戊午 戊午', () => {
  const r = computeBazi({
    birth: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
    timeZone: 'Asia/Shanghai',
    longitude: 116.4074,
    gender: 'male',
    options: { trueSolarTime: false },
  });
  const p = r.pillars;
  assert.deepEqual([p.year.name, p.month.name, p.day.name, p.hour.name], ['己卯', '丙子', '戊午', '戊午']);
  assert.equal(r.zodiac, '兔');
  assert.equal(r.dayMaster.stem, '戊');
  assert.equal(r.luck.forward, false, '阴年男命逆排');
  assert.equal(r.luck.pillars[0]!.name, '乙亥');
  const total = Object.values(r.elementCount).reduce((a, b) => a + b, 0);
  assert.equal(total, 8);
});

test('立春前后年柱切换', () => {
  const base = { timeZone: 'Asia/Shanghai', longitude: 120, gender: 'female' as const, options: { trueSolarTime: false } };
  // 2024 立春约为北京时间 2月4日 16:27
  const before = computeBazi({ ...base, birth: { year: 2024, month: 2, day: 4, hour: 15, minute: 0 } });
  const after = computeBazi({ ...base, birth: { year: 2024, month: 2, day: 4, hour: 18, minute: 0 } });
  assert.equal(before.pillars.year.name, '癸卯');
  assert.equal(before.pillars.month.name, '乙丑');
  assert.equal(after.pillars.year.name, '甲辰');
  assert.equal(after.pillars.month.name, '丙寅');
});

test('子时流派：23:30 出生', () => {
  const base = {
    birth: { year: 2000, month: 1, day: 1, hour: 23, minute: 30 },
    timeZone: 'Asia/Shanghai',
    longitude: 120,
    gender: 'male' as const,
  };
  const nextDay = computeBazi({ ...base, options: { trueSolarTime: false, ziHour: 'next-day-at-23' } });
  assert.equal(nextDay.pillars.day.name, '己未');
  assert.equal(nextDay.pillars.hour.name, '甲子');
  const split = computeBazi({ ...base, options: { trueSolarTime: false, ziHour: 'split' } });
  assert.equal(split.pillars.day.name, '戊午');
  assert.equal(split.pillars.hour.name, '甲子');
});

test('真太阳时：曼谷经度 100.5°，比东七区标准时慢约 18 分钟，再加均时差', () => {
  const r = computeBazi({
    birth: { year: 2024, month: 5, day: 10, hour: 12, minute: 0 },
    timeZone: 'Asia/Bangkok',
    longitude: 100.5018,
    gender: 'male',
  });
  // 地方平太阳时 11:42，五月中旬均时差约 +3.6 分钟
  assert.match(r.meta.calcTime, /^2024-05-10 11:4[5-6]$/);
});

test('历史夏令时：上海 1988 年 6 月为 UTC+9', () => {
  const { offsetMinutes, utcMs } = zonedTimeToUtc({ year: 1988, month: 6, day: 1, hour: 12, minute: 0 }, 'Asia/Shanghai');
  assert.equal(offsetMinutes, 540);
  assert.equal(new Date(utcMs).toISOString(), '1988-06-01T03:00:00.000Z');
});

test('输入校验', () => {
  assert.throws(() =>
    computeBazi({
      birth: { year: 2023, month: 2, day: 29, hour: 0, minute: 0 },
      timeZone: 'Asia/Bangkok',
      longitude: 100,
      gender: 'male',
    }),
  );
  assert.throws(() =>
    computeBazi({
      birth: { year: 2023, month: 2, day: 1, hour: 0, minute: 0 },
      timeZone: 'Mars/Olympus',
      longitude: 100,
      gender: 'male',
    }),
  );
});

test('不知道出生时间：只排三柱，五行计六个字', () => {
  const r = computeBazi({
    birth: { year: 2000, month: 1, day: 1, hour: 0, minute: 0 },
    timeZone: 'Asia/Shanghai',
    longitude: 116.4,
    gender: 'male',
    hourKnown: false,
  });
  assert.equal(r.pillars.hour, null);
  assert.deepEqual([r.pillars.year.name, r.pillars.month.name, r.pillars.day.name], ['己卯', '丙子', '戊午']);
  assert.equal(Object.values(r.elementCount).reduce((a, b) => a + b, 0), 6);
  assert.equal(r.meta.hourKnown, false);
  assert.deepEqual(r.meta.uncertain, []);
});

test('不知道出生时间且当天立春：标出年柱和月柱不确定', () => {
  const r = computeBazi({
    birth: { year: 2024, month: 2, day: 4, hour: 0, minute: 0 },
    timeZone: 'Asia/Shanghai',
    longitude: 120,
    gender: 'female',
    hourKnown: false,
    options: { trueSolarTime: false },
  });
  assert.deepEqual(r.meta.uncertain, ['year', 'month']);
});
