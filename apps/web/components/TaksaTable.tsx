import { PLANETS, TAKSA_HOUSES, HOUSE_NAMES, taksaChart, type ThaiBirthDayKey } from '@lucky/core';
import type { Locale, Messages } from '@lucky/content';

/** 某生日星期的ทักษา八宫表 */
export function TaksaTable({ day, locale, t }: { day: ThaiBirthDayKey; locale: Locale; t: Messages['taksa'] }) {
  const chart = taksaChart(day);
  const kalakini = PLANETS[chart.kalakini];
  const lettersOf = (p: (typeof PLANETS)[keyof typeof PLANETS]) => (p.key === 'sun' ? `${t.vowels}（อ ะ า …）` : p.letters.join(' '));

  return (
    <section className="taksa">
      <h2>{t.title}</h2>
      <p className="hint">{t.intro}</p>
      <div className="table-scroll">
        <table className="taksa-table">
          <thead>
            <tr>
              <th>{t.house}</th>
              <th>{t.planet}</th>
              <th>{t.colors}</th>
              <th>{t.letters}</th>
            </tr>
          </thead>
          <tbody>
            {TAKSA_HOUSES.map((h) => {
              const p = PLANETS[chart[h]];
              return (
                <tr key={h} className={h === 'kalakini' ? 'kalakini' : undefined}>
                  <th scope="row">
                    {HOUSE_NAMES[h].th}
                    {locale !== 'th' && <span className="hint block">{HOUSE_NAMES[h][locale]}</span>}
                    <span className="hint block">{t.houses[h]}</span>
                  </th>
                  <td>
                    {p.name.th} ({p.number})
                    {locale !== 'th' && <span className="hint block">{p.name[locale]}</span>}
                  </td>
                  <td>
                    <span className="swatch inline-swatch" style={{ background: p.color.hex }} aria-hidden /> {p.color[locale]}
                  </td>
                  <td className="letters">{lettersOf(p)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="kalakini-note">
        <strong>{t.kalakiniLetters}：</strong> {lettersOf(kalakini)}
      </p>
    </section>
  );
}
