import { thaiBirthDay, type ThaiBirthDayKey } from '@lucky/core';
import type { BirthValue } from '@/components/BirthInput';

/** 由出生信息求泰式生日星期；不知道时间时按日历星期（星期三按白天） */
export function birthDayKeyOf(v: BirthValue): ThaiBirthDayKey {
  return thaiBirthDay(v.hourKnown ? v : { ...v, hour: 12, minute: 0 }).key;
}
