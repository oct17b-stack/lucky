import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeThaiName, analyzeThaiPlate, letterValue, numerologySum } from '../src/index.ts';

test('字母数值：与来源表一致', () => {
  const table: Record<string, number> = {
    ก: 1, ด: 1, ท: 1, ถ: 1, ภ: 1, ฤ: 1, '่': 1, 'ุ': 1, า: 1, ำ: 1,
    ข: 2, ช: 2, ง: 2, บ: 2, ป: 2, '้': 2, เ: 2, แ: 2, 'ู': 2,
    ฆ: 3, ต: 3, ฑ: 3, ฒ: 3, '๋': 3, ฃ: 3,
    ค: 4, ธ: 4, ญ: 4, ร: 4, ษ: 4, ะ: 4, 'ิ': 4, โ: 4, 'ั': 4,
    ฉ: 5, ณ: 5, ฌ: 5, น: 5, ม: 5, ห: 5, ฎ: 5, ฬ: 5, ฮ: 5, 'ึ': 5,
    จ: 6, ล: 6, ว: 6, อ: 6, ใ: 6,
    ซ: 7, ศ: 7, ส: 7, '๊': 7, 'ี': 7, 'ื': 7,
    ผ: 8, ฝ: 8, พ: 8, ฟ: 8, ย: 8, '็': 8,
    ฏ: 9, ฐ: 9, ไ: 9, '์': 9,
  };
  for (const [ch, v] of Object.entries(table)) assert.equal(letterValue(ch), v, ch);
  // 每个泰文辅音（ก–ฮ，除废弃的 ฅ、ฦ 外）都有值
  for (let c = 0x0e01; c <= 0x0e2e; c++) {
    const ch = String.fromCharCode(c);
    if (ch === 'ฅ' || ch === 'ฦ') continue; // 两个废弃字母，来源表都没有给值
    assert.ok(letterValue(ch) > 0, `${ch} 没有数值`);
  }
});

test('名字分析：สมชาย（星期日出生），ส 是กาลกิณี', () => {
  // ส7 + ม5 + ช2 + า1 + ย8 = 23
  assert.equal(numerologySum('สมชาย'), 23);
  const r = analyzeThaiName('sun', 'สมชาย', 'ใจดี');
  assert.deepEqual(r.kalakini, ['ส']);
  assert.equal(r.sums.name, 23);
  // ใ6 + จ6 + ด1 + ี7 = 20
  assert.equal(r.sums.surname, 20);
  assert.equal(r.sums.total, 43);
  assert.equal(r.letters.find((l) => l.ch === 'ม')?.house, 'utsaha'); // พฤหัส 在星期日的 อุตสาหะ
  assert.throws(() => analyzeThaiName('sun', 'Somchai'));
});

test('星期一出生的กาลกิณี是元音组', () => {
  const r = analyzeThaiName('mon', 'อนันต์');
  assert.equal(r.kalakiniIsVowelGroup, true);
  assert.ok(r.kalakini.includes('อ'));
});

test('车牌：1กข 1234', () => {
  const r = analyzeThaiPlate('1กข 1234');
  // 1 + ก1 + ข2 + 1+2+3+4 = 14
  assert.equal(r.sum, 14);
  assert.equal(r.plate, '1กข 1234');
  assert.equal(analyzeThaiPlate('กข-9 กรุงเทพมหานคร'.replace('-', ' ')).sum, 1 + 2 + 9);
  assert.throws(() => analyzeThaiPlate('ABC 123'));
});
