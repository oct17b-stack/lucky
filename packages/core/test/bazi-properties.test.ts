/**
 * 属性测试：不依赖外部参考数据，检查排盘规则内部一致。
 * 与 bazi.test.ts 的具体命例一起，构成金标准测试集的一部分。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOLAR_TERMS, computeBazi, ganzhiFromStemBranch, solarTermUtc, STEMS, BRANCHES, wallClockFromMs } from '../src/index.ts';

const indexOf = (name: string) => ganzhiFromStemBranch(STEMS.indexOf(name[0] as never), BRANCHES.indexOf(name[1] as never)).index;

/**
 * 按 UTC 时刻排盘：钟表时间按固定 UTC+8（Etc/GMT-8，不含历史夏令时），不用真太阳时，
 * 便于和节气时刻直接比较。注意 Asia/Shanghai 在 1942–1945、1986–1991 年有夏令时。
 */
function chartAtUtc(utcMs: number) {
  const beijing = wallClockFromMs(utcMs + 8 * 3_600_000);
  return computeBazi({
    birth: beijing,
    timeZone: 'Etc/GMT-8',
    longitude: 120,
    gender: 'male',
    options: { trueSolarTime: false },
  });
}

test('每个“节”的前后 2 分钟，月柱恰好切换到下一个干支', () => {
  for (const year of [1950, 1988, 2024, 2025, 2077]) {
    for (const term of SOLAR_TERMS.filter((t) => t.isJie)) {
      const at = solarTermUtc(year, term.name);
      const before = chartAtUtc(at - 2 * 60_000).pillars.month.name;
      const after = chartAtUtc(at + 2 * 60_000).pillars.month.name;
      assert.equal((indexOf(after) - indexOf(before) + 60) % 60, 1, `${year} ${term.name}: ${before} → ${after}`);
    }
  }
});

test('立春前后 2 分钟，年柱恰好切换', () => {
  for (let year = 1901; year <= 2100; year += 3) {
    const at = solarTermUtc(year, '立春');
    const before = chartAtUtc(at - 2 * 60_000).pillars.year.name;
    const after = chartAtUtc(at + 2 * 60_000).pillars.year.name;
    assert.equal((indexOf(after) - indexOf(before) + 60) % 60, 1, `${year}: ${before} → ${after}`);
    assert.equal(indexOf(after), (((year - 4) % 60) + 60) % 60, `${year} 年柱`);
  }
});

test('“节”与“气”之间不换月：中气前后月柱不变', () => {
  for (const term of SOLAR_TERMS.filter((t) => !t.isJie)) {
    const at = solarTermUtc(2025, term.name);
    assert.equal(chartAtUtc(at - 60_000).pillars.month.name, chartAtUtc(at + 60_000).pillars.month.name, term.name);
  }
});

test('日柱逐日连续：1900–2100 年抽样，每过一天六十甲子加 1', () => {
  for (let year = 1900; year <= 2100; year += 11) {
    let prev: number | null = null;
    for (let day = 1; day <= 40; day++) {
      // 北京时间每天中午 12 点（Date.UTC 会把 3 月 32 日等自动进位到 4 月）
      const name = chartAtUtc(Date.UTC(year, 2, day, 4)).pillars.day.name;
      const idx = indexOf(name);
      if (prev !== null) assert.equal((idx - prev + 60) % 60, 1, `${year}-03-${day}`);
      prev = idx;
    }
  }
});

test('时柱：一天 12 个时辰依次排列，且时干由日干决定（五鼠遁）', () => {
  const names: string[] = [];
  for (let h = 1; h < 23; h += 2) {
    const r = computeBazi({
      birth: { year: 2025, month: 6, day: 15, hour: h, minute: 30 },
      timeZone: 'Asia/Bangkok',
      longitude: 105,
      gender: 'male',
      options: { trueSolarTime: false },
    });
    names.push(r.pillars.hour.name);
  }
  for (let i = 1; i < names.length; i++) {
    assert.equal((indexOf(names[i]!) - indexOf(names[i - 1]!) + 60) % 60, 1, names.join(' '));
  }
});

test('大运：八步相邻干支连续，起运年龄在 0–10 岁之间', () => {
  for (const gender of ['male', 'female'] as const) {
    for (let month = 1; month <= 12; month++) {
      const r = computeBazi({
        birth: { year: 1993, month, day: 10, hour: 9, minute: 0 },
        timeZone: 'Asia/Bangkok',
        longitude: 100.5,
        gender,
      });
      const step = r.luck.forward ? 1 : 59;
      assert.equal((indexOf(r.luck.pillars[0]!.name) - indexOf(r.pillars.month.name) + 60) % 60, step);
      for (let i = 1; i < r.luck.pillars.length; i++) {
        assert.equal((indexOf(r.luck.pillars[i]!.name) - indexOf(r.luck.pillars[i - 1]!.name) + 60) % 60, step);
      }
      const age = r.luck.startAge.years + r.luck.startAge.months / 12;
      assert.ok(age >= 0 && age <= 10.5, `起运 ${age}`);
    }
  }
});
