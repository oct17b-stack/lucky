'use client';

import { useState } from 'react';
import { analyzeThaiMobile, type PhoneAnalysis } from '@lucky/core';
import { THAI_PHONE_RULES, type Locale, type Messages } from '@lucky/content';
import { ShareButtons } from './ShareButtons';

export function PhoneForm({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.phone;
  const n = m.numbers;
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setResult(analyzeThaiMobile(value, THAI_PHONE_RULES));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

  const display = (num: string) => `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;

  return (
    <>
      <form className="form" onSubmit={submit}>
        <input inputMode="tel" placeholder={t.placeholder} value={value} onChange={(e) => setValue(e.target.value)} required />
        <button className="button" type="submit">
          {t.submit}
        </button>
      </form>
      {error && <p className="error">{t.invalid}</p>}
      {result && (
        <section className="result">
          <p className="plate phone-number">{display(result.normalized)}</p>
          <p className={`verdict verdict-${result.verdict}`}>
            <span className="small-label">{n.verdictTitle}</span>
            {n.verdicts[result.verdict]}
          </p>
          {result.strengths.length > 0 && (
            <p>
              <strong>{n.strengths}: </strong>
              {result.strengths.map((s) => n.topics[s]).join(' · ')}
            </p>
          )}
          {result.warnings.map((w) => (
            <p key={w} className="relation relation-clash">
              {n.warnings[w]}
            </p>
          ))}

          <h2>{n.pairsTitle}</h2>
          <ul className="pair-list">
            {result.pairs.map((p) => (
              <li key={p.position} className={`tone-${p.rule?.tone ?? 'unknown'}${p.last ? ' last' : ''}`}>
                <span className="pair-digits">{p.pair}</span>
                <span className="pair-tone">{p.rule ? n.tones[p.rule.tone] : '—'}</span>
                <span className="pair-meaning">
                  {p.rule?.meaning[locale]}
                  {p.last && <span className="hint block">{n.lastPair}</span>}
                </span>
              </li>
            ))}
          </ul>

          <h2>
            {t.sum}: {result.sum}
          </h2>
          {result.sumRule && (
            <p className={`tone-text tone-${result.sumRule.tone}`}>
              <strong>{n.tones[result.sumRule.tone]}</strong> · {result.sumRule.meaning[locale]}
            </p>
          )}

          <ShareButtons t={m.share} text={`${t.title}: ${n.verdicts[result.verdict]}`} />
          <p className="hint">{n.method}</p>
          <p className="hint">{n.sources}</p>
        </section>
      )}
    </>
  );
}
