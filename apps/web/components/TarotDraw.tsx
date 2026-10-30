'use client';

import { useState } from 'react';
import { TAROT_MAJOR, type Locale, type Messages, type TarotCard } from '@lucky/content';
import { ShareButtons } from './ShareButtons';

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

export function TarotDraw({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.tarot;
  const [draw, setDraw] = useState<{ card: TarotCard; reversed: boolean } | null>(null);

  function pick() {
    const v = new Uint32Array(2);
    crypto.getRandomValues(v);
    setDraw({ card: TAROT_MAJOR[v[0]! % TAROT_MAJOR.length]!, reversed: v[1]! % 2 === 1 });
  }

  return (
    <section className="draw">
      {draw ? (
        <div className="tarot-result" aria-live="polite">
          {/* 牌面为本站原创的简洁设计：罗马数字 + 牌名，不使用任何既有塔罗牌的图像 */}
          <div className={`tarot-card${draw.reversed ? ' reversed' : ''}`}>
            <span className="tarot-numeral">{ROMAN[draw.card.n]}</span>
            <span className="tarot-name">{draw.card.name.en}</span>
          </div>
          <h2>{draw.card.name[locale]}</h2>
          <p className="fortune-level">{draw.reversed ? t.reversed : t.upright}</p>
          <p className="fortune-text">{draw.reversed ? draw.card.reversed[locale] : draw.card.upright[locale]}</p>
          <ShareButtons t={m.share} text={`${t.title}: ${draw.card.name[locale]} (${draw.reversed ? t.reversed : t.upright})`} />
        </div>
      ) : (
        <div className="tarot-card back" aria-hidden />
      )}
      <button className="button" type="button" onClick={pick}>
        {draw ? t.again : t.draw}
      </button>
    </section>
  );
}
