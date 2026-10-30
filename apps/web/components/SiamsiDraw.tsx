'use client';

import { useState } from 'react';
import { SIAMSI, SIAMSI_TOPICS, format, type Locale, type Messages, type SiamsiStick } from '@lucky/content';
import { ShareButtons } from './ShareButtons';

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
/** 泰文签号用泰文数字，如“ใบที่ ๑๒” */
const stickNumber = (n: number, locale: Locale) => (locale === 'th' ? String(n).replace(/\d/g, (d) => THAI_DIGITS[Number(d)]!) : String(n));

export function SiamsiDraw({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.siamsi;
  const [stick, setStick] = useState<SiamsiStick | null>(null);
  const [shaking, setShaking] = useState(false);

  function shake() {
    setShaking(true);
    setStick(null);
    // 摇签动画约 1.2 秒，然后随机抽一支
    setTimeout(() => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      setStick(SIAMSI[values[0]! % SIAMSI.length]!);
      setShaking(false);
    }, 1200);
  }

  const title = stick ? format(t.number, { n: stickNumber(stick.n, locale) }) : '';

  return (
    <section className="draw">
      <ol className="how-to">
        {t.howTo.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
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
        <article className={`fortune level-${stick.level}`} aria-live="polite">
          <p className="fortune-number">{title}</p>
          <p className="fortune-level">{t.levels[stick.level]}</p>
          <h3 className="fortune-label">{t.verse}</h3>
          <p className="fortune-verse">{stick.verse[locale]}</p>
          <h3 className="fortune-label">{t.summary}</h3>
          <p className="fortune-text">{stick.summary[locale]}</p>
          <dl className="fortune-topics">
            {SIAMSI_TOPICS.map((topic) => (
              <div key={topic}>
                <dt>{t.topics[topic]}</dt>
                <dd>{stick.topics[topic][locale]}</dd>
              </div>
            ))}
          </dl>
          <ShareButtons t={m.share} text={`${t.title} ${title} · ${t.levels[stick.level]}`} />
        </article>
      )}
    </section>
  );
}
