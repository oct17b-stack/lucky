'use client';

import { useState } from 'react';
import { thaiBirthDay, type ThaiBirthDayInfo } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';
import { BirthDayCard } from './BirthDayCard';

export function BirthdayForm({ locale, t }: { locale: Locale; t: Messages['birthday'] }) {
  const [value, setValue] = useState('1995-03-15T09:00');
  const [info, setInfo] = useState<ThaiBirthDayInfo | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const [datePart = '', timePart = '00:00'] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    if (!year || !month || !day || hour === undefined || minute === undefined) return;
    setInfo(thaiBirthDay({ year, month, day, hour, minute }));
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <label>
          {t.pickDate}
          <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} required />
        </label>
        <button className="button" type="submit">
          {t.submit}
        </button>
        <p className="hint">{t.sunriseNote}</p>
      </form>
      {info && <BirthDayCard info={info} locale={locale} t={t} />}
    </>
  );
}
