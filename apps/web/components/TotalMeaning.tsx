import { format, totalMeaning, type Locale, type Messages } from '@lucky/content';

/** 名字、车牌总和的含义（通用 1–100 表，名字专用说法优先） */
export function TotalMeaning({ total, locale, m }: { total: number; locale: Locale; m: Messages }) {
  const n = m.numbers;
  const { read, meaning } = totalMeaning(total);
  return (
    <div className="total-meaning">
      <h3>{n.totalTitle}</h3>
      {read !== total && <p className="hint">{format(n.readAs, { n: read })}</p>}
      {meaning ? (
        <p className={`tone-text tone-${meaning.tone}`}>
          <strong>{n.tones[meaning.tone]}</strong> · {meaning.meaning[locale]}
        </p>
      ) : (
        <p className="hint">—</p>
      )}
      <p className="hint">{n.sources}</p>
    </div>
  );
}
