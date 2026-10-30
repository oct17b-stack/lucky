'use client';

import { useState } from 'react';
import { HOUSE_NAMES, ZODIAC_NAMES, compatibility, zodiacIndexFor, type CompatibilityResult, type ZodiacYearRule } from '@lucky/core';
import { format, type Locale, type Messages } from '@lucky/content';
import { birthDayKeyOf } from '@/lib/birth';
import { BirthInput, DEFAULT_BIRTH, isValidBirthDate, type BirthValue } from './BirthInput';
import { ShareButtons } from './ShareButtons';
import { ZodiacRuleSelect } from './ZodiacRuleSelect';

export function CompatibilityForm({ locale, m }: { locale: Locale; m: Messages }) {
  const t = m.compatibility;
  const [me, setMe] = useState<BirthValue>({ ...DEFAULT_BIRTH, hourKnown: false });
  const [partner, setPartner] = useState<BirthValue>({ ...DEFAULT_BIRTH, year: 1992, month: 11, day: 3, hourKnown: false });
  const [rule, setRule] = useState<ZodiacYearRule>('lunarNewYear');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidBirthDate(me) || !isValidBirthDate(partner)) {
      setError(true);
      setResult(null);
      return;
    }
    setError(false);
    setResult(
      compatibility(
        { zodiac: zodiacIndexFor(me, rule), birthDay: birthDayKeyOf(me) },
        { zodiac: zodiacIndexFor(partner, rule), birthDay: birthDayKeyOf(partner) },
      ),
    );
  }

  const house = (h: keyof typeof HOUSE_NAMES) => (locale === 'th' ? HOUSE_NAMES[h].th : `${HOUSE_NAMES[h][locale]}（${HOUSE_NAMES[h].th}）`);

  return (
    <>
      <form className="form" onSubmit={submit}>
        <h2 className="form-section">{t.you}</h2>
        <BirthInput locale={locale} t={m.birthInput} value={me} onChange={setMe} idPrefix="me" />
        <h2 className="form-section">{t.partner}</h2>
        <BirthInput locale={locale} t={m.birthInput} value={partner} onChange={setPartner} idPrefix="partner" />
        <ZodiacRuleSelect value={rule} onChange={setRule} t={m.zodiac} />
        <button className="button" type="submit">
          {t.submit}
        </button>
      </form>
      {error && <p className="error">{m.bazi.error}</p>}
      {result && (
        <section className="result">
          <h2>{t.byZodiac}</h2>
          <p className="big-text">
            {ZODIAC_NAMES[locale][result.zodiac.a]} × {ZODIAC_NAMES[locale][result.zodiac.b]}
          </p>
          <p className={`relation relation-${result.zodiac.relation}`}>{t.pairs[result.zodiac.relation]}</p>
          <h2>{t.byTaksa}</h2>
          <p>{format(t.taksaResult, { house: house(result.taksa.partnerInMine) })}</p>
          <p className="hint">{m.taksa.houses[result.taksa.partnerInMine]}</p>
          <ShareButtons t={m.share} text={`${t.title}: ${t.pairs[result.zodiac.relation]}`} />
        </section>
      )}
    </>
  );
}
