'use client';

import { useState } from 'react';
import { analyzeThaiMobile, type PhoneAnalysis } from '@lucky/core';
import type { Messages } from '@lucky/content';

export function PhoneForm({ t }: { t: Messages['phone'] }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // 规则表由顾问提供后，从服务端加载并作为第二个参数传入
      setResult(analyzeThaiMobile(value));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

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
          <p className="big-number">
            {t.sum}: <strong>{result.sum}</strong>
          </p>
          <h2>{t.pairs}</h2>
          <ul className="pairs">
            {result.pairs.map((p) => (
              <li key={p.position} className={p.rule ? `tone-${p.rule.tone}` : 'tone-unknown'}>
                {p.pair}
              </li>
            ))}
          </ul>
          <p className="hint">{t.rulesPending}</p>
        </section>
      )}
    </>
  );
}
