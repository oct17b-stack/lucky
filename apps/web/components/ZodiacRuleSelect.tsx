'use client';

import { ZODIAC_YEAR_RULES, type ZodiacYearRule } from '@lucky/core';
import type { Messages } from '@lucky/content';

export function ZodiacRuleSelect({ value, onChange, t }: { value: ZodiacYearRule; onChange: (r: ZodiacYearRule) => void; t: Messages['zodiac'] }) {
  return (
    <label>
      {t.zodiacYearRule}
      <select value={value} onChange={(e) => onChange(e.target.value as ZodiacYearRule)}>
        {ZODIAC_YEAR_RULES.map((r) => (
          <option key={r} value={r}>
            {t.rules[r]}
          </option>
        ))}
      </select>
    </label>
  );
}
