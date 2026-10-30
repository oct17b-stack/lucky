'use client';

import { useState } from 'react';
import { SIAMSI, format, type Locale, type Messages, type SiamsiStick } from '@lucky/content';
import { ShareButtons } from './ShareButtons';

export function SiamsiDraw({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.siamsi;
  const [stick, setStick] = useState<SiamsiStick | null>(null);
  const [shaking, setShaking] = useState(false);

  function shake() {
    setShaking(true);
    setStick(null);
    // 摇签动画约 1 秒，然后随机抽一支
    setTimeout(() => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      setStick(SIAMSI[values[0]! % SIAMSI.length]!);
      setShaking(false);
    }, 1000);
  }

  return (
    <section className="draw">
      <div className={`siamsi-cup${shaking ? ' shaking' : ''}`} aria-hidden>
        <svg viewBox="0 0 120 160" width="120" height="160">
          {[20, 34, 48, 62, 76, 90].map((x, i) => (
            <rect key={x} x={x} y={10 + (i % 3) * 6} width="8" height="80" rx="3" fill="var(--gold)" />
          ))}
          <path d="M14 70 H106 L96 150 H24 Z" fill="var(--accent)" />
        </svg>
      </div>
      <button className="button" type="button" onClick={shake} disabled={shaking}>
        {stick ? t.again : t.shake}
      </button>
      {stick && (
        <div className={`fortune level-${stick.level}`} aria-live="polite">
          <p className="fortune-number">{format(t.number, { n: stick.n })}</p>
          <p className="fortune-level">{t.levels[stick.level]}</p>
          <p className="fortune-text">{stick.text[locale]}</p>
          <ShareButtons t={m.share} text={`${t.title} ${format(t.number, { n: stick.n })} · ${t.levels[stick.level]}`} />
        </div>
      )}
    </section>
  );
}
