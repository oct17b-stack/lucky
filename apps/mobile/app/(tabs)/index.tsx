import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ZODIAC_NAMES, dailyAlmanac, dailyColors, formatThaiLunar, solarTermLabel, todayIn, weekdayOf } from '@lucky/core';
import { format } from '@lucky/content';
import { API_URL, deviceLocale, t } from '../../lib/i18n';

/** 今日：万年历 + 星期代表色，并检查与后端（NAS 测试版）的连接 */
export default function TodayScreen() {
  const today = todayIn('Asia/Bangkok');
  const a = dailyAlmanac(today.year, today.month, today.day);
  const colors = dailyColors(weekdayOf(today.year, today.month, today.day));
  const c = t.calendar;
  const [server, setServer] = useState<string>('…');

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((j: { env: string; engine: string }) => setServer(`${j.env} · engine ${j.engine}`))
      .catch(() => setServer('offline'));
  }, []);

  const lunar =
    deviceLocale === 'zh-hans' || deviceLocale === 'zh-hant'
      ? a.lunar.chinese
      : `${a.lunar.leap ? c.leapMark : ''}${format(c.lunarFormat, { month: a.lunar.month, day: a.lunar.day })}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t.dailyColor.title}</Text>
      <View style={styles.colorGrid}>
        {(['work', 'money', 'patron', 'avoid'] as const).map((p) => (
          <View key={p} style={[styles.colorCell, p === 'avoid' && styles.avoid]}>
            <View style={[styles.swatch, { backgroundColor: colors[p].color.hex }]} />
            <Text style={styles.label}>{t.dailyColor.purposes[p]}</Text>
            <Text style={styles.value}>{colors[p].color[deviceLocale]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.title}>{c.todayTitle}</Text>
      <View style={[styles.card, { borderTopColor: a.weekday.color.hex }]}>
        <Text style={styles.date}>
          {today.year}-{String(today.month).padStart(2, '0')}-{String(today.day).padStart(2, '0')} · {a.weekday.name[deviceLocale]}
        </Text>
        <Text style={styles.lunar}>
          {c.lunar} {lunar}
        </Text>
        <Row label={t.thaiLunar.title} value={`${formatThaiLunar(a.thaiLunar)}${a.thaiLunar.holyDay ? ` · ${t.thaiLunar.holyDay}` : ''}`} />
        <Row label={c.buddhist} value={String(a.buddhistYear)} />
        <Row label={c.ganzhi} value={`${a.ganzhi.year} · ${a.ganzhi.month} · ${a.ganzhi.day}`} />
        <Row label={c.clash} value={format(c.clashFormat, { animal: ZODIAC_NAMES[deviceLocale][a.clashZodiacIndex]! })} />
        <Row label={c.solarTerm} value={a.solarTerm ? solarTermLabel(a.solarTerm.name, deviceLocale) : c.none} />
        <View style={styles.colorRow}>
          <View style={[styles.swatch, { backgroundColor: a.weekday.color.hex }]} />
          <Text style={styles.value}>
            {c.weekdayColor}: {deviceLocale === 'th' ? a.weekday.color.th : a.weekday.color.en}
          </Text>
        </View>
      </View>
      <Text style={styles.footer}>API: {server}</Text>
      <Text style={styles.footer}>{t.common.disclaimer}</Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#e6dccf', borderTopWidth: 6, borderRadius: 12, padding: 16, gap: 8 },
  date: { fontSize: 18, fontWeight: '700' },
  lunar: { fontSize: 16, color: '#7a1f2b', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: '#6f625a' },
  value: { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  footer: { color: '#6f625a', fontSize: 12, marginTop: 12 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCell: { width: '47%', borderWidth: 1, borderColor: '#e6dccf', borderRadius: 10, padding: 10, gap: 4 },
  avoid: { borderStyle: 'dashed' },
});
