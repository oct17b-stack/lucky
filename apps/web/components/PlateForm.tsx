'use client';

import { useState } from 'react';
import { analyzeThaiPlate, type PlateAnalysis } from '@lucky/core';
import type { Messages } from '@lucky/content';
import { ShareButtons } from './ShareButtons';

export function PlateForm({ m }: { m: Messages }) {
  const t = m.plate;
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PlateAnalysis | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setResult(analyzeThaiPlate(value));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <input lang="th" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.placeholder} required />
        <button className="button" type="submit">
          {t.submit}
        </button>
      </form>
      {error && <p className="error">{t.invalid}</p>}
      {result && (
        <section className="result">
          <p className="plate">{result.plate}</p>
          <p className="big-number">
            {t.sum}: <strong>{result.sum}</strong>
          </p>
          <p className="hint letters">
            {[...result.letters.map((l) => `${l.ch}=${l.value}`), ...result.digits.map(String)].join(' + ')}
          </p>
          <p className="hint">{m.name.numerologyPending}</p>
          <ShareButtons t={m.share} text={`${t.title}: ${result.plate} = ${result.sum}`} />
        </section>
      )}
    </>
  );
}
