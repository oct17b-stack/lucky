import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANETS, dailyColors, dailyTaksaReading, houseOfPlanet, planetOfLetter, taksaChart, type ThaiBirthDayKey } from '../src/index.ts';

test('กาลกิณี 字母组：与泰国通行说法一致', () => {
  const expected: Record<ThaiBirthDayKey, string[]> = {
    sun: ['ศ', 'ษ', 'ส', 'ห', 'ฬ', 'ฮ'],
    mon: ['อ'], // 元音组
    tue: ['ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง'],
    'wed-day': ['จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ'],
    thu: ['ด', 'ต', 'ถ', 'ท', 'ธ', 'น'],
    fri: ['ย', 'ร', 'ล', 'ว'],
    sat: ['ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ'],
    'wed-night': ['บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม'],
  };
  for (const [day, letters] of Object.entries(expected) as [ThaiBirthDayKey, string[]][]) {
    const kalakini = PLANETS[taksaChart(day).kalakini].letters;
    for (const l of letters) assert.ok(kalakini.includes(l), `${day} 的กาลกิณี应包含 ${l}`);
  }
});

test('星期日出生的完整 ทักษา', () => {
  assert.deepEqual(taksaChart('sun'), {
    boriwan: 'sun',
    ayu: 'moon',
    det: 'mars',
    si: 'mercury',
    mula: 'saturn',
    utsaha: 'jupiter',
    montri: 'rahu',
    kalakini: 'venus',
  });
});

test('每个生日星期的八宫恰好用到八颗星曜各一次', () => {
  for (const day of ['sun', 'mon', 'tue', 'wed-day', 'wed-night', 'thu', 'fri', 'sat'] as const) {
    assert.equal(new Set(Object.values(taksaChart(day))).size, 8, day);
  }
});

test('每日幸运色：星期一工作绿色、财运紫色、忌红色', () => {
  const mon = dailyColors(1);
  assert.equal(mon.work.color.th, 'เขียว');
  assert.equal(mon.money.color.th, 'ม่วง');
  assert.equal(mon.avoid.color.th, 'แดง');
});

test('字母归属', () => {
  assert.equal(planetOfLetter('ก'), 'moon');
  assert.equal(planetOfLetter('ร'), 'rahu');
  assert.equal(planetOfLetter('า'), 'sun');
  assert.equal(planetOfLetter('่'), null);
});

test('当天星曜落宫：星期日出生的人，星期一是 อายุ 日', () => {
  assert.equal(houseOfPlanet('sun', 'moon'), 'ayu');
  // 2026-11-02 是星期一
  const r = dailyTaksaReading('sun', 2026, 11, 2);
  assert.equal(r.dayPlanet, 'moon');
  assert.equal(r.house, 'ayu');
  assert.deepEqual(r.luckyNumbers, [4, 3]);
});
