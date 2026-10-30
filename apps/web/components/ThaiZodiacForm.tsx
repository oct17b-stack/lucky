'use client';

import { useState } from 'react';
import { CITIES, ZODIAC_NAMES, thaiZodiac, zodiacIndexFor, type ThaiZodiacResult, type ZodiacYearRule } from '@lucky/core';
import { format, type Locale, type Messages } from '@lucky/content';
import { BirthInput, DEFAULT_BIRTH, isValidBirthDate, type BirthValue } from './BirthInput';
import { ShareButtons } from './ShareButtons';
import { ZodiacRuleSelect } from './ZodiacRuleSelect';

export function ThaiZodiacForm({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.zodiac;
  const [birth, setBirth] = useState<BirthValue>(DEFAULT_BIRTH);
  const [cityId, setCityId] = useState('bangkok');
  const [rule, setRule] = useState<ZodiacYearRule>('lunarNewYear');
  const [result, setResult] = useState<{ z: ThaiZodiacResult; animal: number } | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const city = CITIES.find((c) => c.id === cityId);
    if (!city || !isValidBirthDate(birth)) {
      setError(true);
      setResult(null);
      return;
    }
    setError(false);
    setResult({
      z: thaiZodiac({ birth, timeZone: city.timeZone, latitude: city.lat, longitude: city.lng, hourKnown: birth.hourKnown }),
      animal: zodiacIndexFor(birth, rule),
    });
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <BirthInput locale={locale} t={m.birthInput} value={birth} onChange={setBirth} />
        <label>
          {m.bazi.form.city}
          <select value={cityId} onChange={(e) => setCityId(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <ZodiacRuleSelect value={rule} onChange={setRule} t={t} />
        <button className="button" type="submit">
          {m.birthday.submit}
        </button>
      </form>
      {error && <p className="error">{m.bazi.error}</p>}
      {result && (
        <section className="result">
          <dl className="facts">
            <dt>{t.sunSign}</dt>
            <dd className="big-text">{signName(result.z.sunSign, locale, t)}</dd>
            <dt>{t.ascendant}</dt>
            <dd className="big-text">{result.z.ascendant ? signName(result.z.ascendant.sign, locale, t) : '—'}</dd>
            <dt>{t.zodiacYear}</dt>
            <dd>{ZODIAC_NAMES[locale][result.animal]}</dd>
          </dl>
          {!result.z.ascendant && <p className="hint">{t.ascendantNeedsTime}</p>}
          <p className="hint">{format(t.westernNote, { sign: signName(result.z.westernSign, locale, t) })}</p>
          <p className="hint">
            ayanamsa {result.z.meta.ayanamsa}° ({result.z.meta.model})
          </p>
          <ShareButtons t={m.share} text={`${t.sunSign}: ${signName(result.z.sunSign, locale, t)}`} />
        </section>
      )}
    </>
  );
}

function signName(i: number, locale: Locale, t: Messages['zodiac']): string {
  return locale === 'th' ? `ราศี${t.signs[i]}` : t.signs[i]!;
}
