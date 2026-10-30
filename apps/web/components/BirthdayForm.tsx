'use client';

import { useState } from 'react';
import { thaiBirthDay, thaiBirthDayByKey, type ThaiBirthDayInfo } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';
import { BirthDayCard } from './BirthDayCard';
import { BirthInput, DEFAULT_BIRTH, isValidBirthDate, type BirthValue } from './BirthInput';
import { ShareButtons } from './ShareButtons';
import { TaksaTable } from './TaksaTable';

export function BirthdayForm({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.birthday;
  const [birth, setBirth] = useState<BirthValue>({ ...DEFAULT_BIRTH, year: 1995, month: 3, day: 15 });
  const [wedNight, setWedNight] = useState(false);
  const [info, setInfo] = useState<ThaiBirthDayInfo | null>(null);

  const isWednesday = isValidBirthDate(birth) && new Date(Date.UTC(birth.year, birth.month - 1, birth.day)).getUTCDay() === 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidBirthDate(birth)) return;
    if (birth.hourKnown) {
      setInfo(thaiBirthDay(birth));
    } else {
      // 不知道时间：按日历上的星期；星期三由用户选择白天或夜晚
      const base = thaiBirthDay({ ...birth, hour: 12, minute: 0 });
      setInfo(isWednesday && wedNight ? thaiBirthDayByKey('wed-night') : base);
    }
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <BirthInput locale={locale} t={m.birthInput} value={birth} onChange={setBirth} />
        {!birth.hourKnown && isWednesday && (
          <fieldset>
            <legend>{m.birthInput.wednesdayQuestion}</legend>
            <label className="inline">
              <input type="radio" checked={!wedNight} onChange={() => setWedNight(false)} /> {m.birthInput.wednesdayDay}
            </label>
            <label className="inline">
              <input type="radio" checked={wedNight} onChange={() => setWedNight(true)} /> {m.birthInput.wednesdayNight}
            </label>
          </fieldset>
        )}
        <button className="button" type="submit">
          {t.submit}
        </button>
        {birth.hourKnown && <p className="hint">{t.sunriseNote}</p>}
      </form>
      {info && (
        <>
          <BirthDayCard info={info} locale={locale} t={t} />
          <ShareButtons t={m.share} text={`${t.yourDay}: ${info.name[locale]}`} path={`/${locale}/lucky-color/${info.key}`} />
          <TaksaTable day={info.key} locale={locale} t={m.taksa} />
        </>
      )}
    </>
  );
}
