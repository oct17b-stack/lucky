'use client';

import { useState } from 'react';
import { HOUSE_NAMES, THAI_BIRTH_DAYS, TAKSA_HOUSES, analyzeThaiName, letterValue, type NameAnalysis, type ThaiBirthDayKey } from '@lucky/core';
import { format, type Locale, type Messages } from '@lucky/content';
import { TotalMeaning } from './TotalMeaning';
import { ShareButtons } from './ShareButtons';

export function NameForm({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.name;
  const [day, setDay] = useState<ThaiBirthDayKey>('sun');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [result, setResult] = useState<NameAnalysis | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setResult(analyzeThaiName(day, name, surname));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <label>
          {m.birthday.yourDay}
          <select value={day} onChange={(e) => setDay(e.target.value as ThaiBirthDayKey)}>
            {THAI_BIRTH_DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.nameLabel}
          <input lang="th" value={name} onChange={(e) => setName(e.target.value)} placeholder="สมชาย" required />
        </label>
        <label>
          {t.surnameLabel}
          <input lang="th" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="ใจดี" />
        </label>
        <button className="button" type="submit">
          {t.submit}
        </button>
      </form>
      {error && <p className="error">{t.notThai}</p>}
      {result && (
        <section className="result">
          <p className={result.kalakini.length ? 'relation relation-clash' : 'relation relation-sixHarmony'}>
            {result.kalakini.length ? format(t.kalakiniFound, { letters: result.kalakini.join(' ') }) : t.kalakiniNone}
          </p>
          {result.kalakiniIsVowelGroup && <p className="hint">{t.vowelNote}</p>}

          <h2>{t.letterHouses}</h2>
          <div className="table-scroll">
            <table className="taksa-table">
              <tbody>
                {TAKSA_HOUSES.map((h) => {
                  const letters = result.letters.filter((l) => l.house === h).map((l) => l.ch);
                  return (
                    <tr key={h} className={h === 'kalakini' ? 'kalakini' : undefined}>
                      <th scope="row">
                        {HOUSE_NAMES[h].th}
                        {locale !== 'th' && <span className="hint block">{HOUSE_NAMES[h][locale]}</span>}
                      </th>
                      <td className="letters">{letters.join(' ') || '—'}</td>
                      <td className="hint">{m.taksa.houses[h]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2>{t.numerology}</h2>
          <p className="big-number">
            {result.sums.surname !== null ? `${result.sums.name} + ${result.sums.surname} = ${result.sums.total}` : result.sums.name}
          </p>
          <p className="hint letters">
            {[...result.name, ...(result.surname ?? '')].map((ch, i) => <span key={i}>{`${ch}${letterValue(ch)} `}</span>)}
          </p>
          <TotalMeaning total={result.sums.total} locale={locale} m={m} />
          <ShareButtons t={m.share} text={t.title} />
        </section>
      )}
    </>
  );
}
