import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CITIES, computeBazi, type BaziResult } from '@lucky/core';
import { deviceLocale, t } from '../../lib/i18n';

/** 离线排盘：计算核心直接在手机上运行 */
export default function BaziScreen() {
  const [date, setDate] = useState('1990-06-15');
  const [time, setTime] = useState('08:30');
  const [cityId, setCityId] = useState('bangkok');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState(false);

  function calculate() {
    try {
      const [y, mo, d] = date.split('-').map(Number);
      const [h, mi] = time.split(':').map(Number);
      const city = CITIES.find((c) => c.id === cityId)!;
      if (!y || !mo || !d || h === undefined || mi === undefined) throw new Error();
      setResult(
        computeBazi({ birth: { year: y, month: mo, day: d, hour: h, minute: mi }, timeZone: city.timeZone, longitude: city.lng, gender }),
      );
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

  const f = t.bazi.form;
  const r = t.bazi.result;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{f.date} (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />
      <Text style={styles.label}>{f.time} (HH:MM)</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />
      <Text style={styles.label}>{f.city}</Text>
      <View style={styles.row}>
        {CITIES.slice(0, 6).map((c) => (
          <Pressable key={c.id} onPress={() => setCityId(c.id)} style={[styles.chip, cityId === c.id && styles.chipOn]}>
            <Text>{c.name[deviceLocale]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {(['male', 'female'] as const).map((g) => (
          <Pressable key={g} onPress={() => setGender(g)} style={[styles.chip, gender === g && styles.chipOn]}>
            <Text>{g === 'male' ? f.male : f.female}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.button} onPress={calculate}>
        <Text style={styles.buttonText}>{f.submit}</Text>
      </Pressable>
      {error && <Text style={styles.error}>{t.bazi.error}</Text>}
      {result && (
        <View style={styles.pillars}>
          {(['year', 'month', 'day', 'hour'] as const).map((k) => (
            <View key={k} style={styles.pillar}>
              <Text style={styles.label}>{r[k]}</Text>
              <Text style={styles.glyph}>{result.pillars[k]?.stem ?? '—'}</Text>
              <Text style={styles.glyph}>{result.pillars[k]?.branch ?? '—'}</Text>
              <Text style={styles.small}>{result.pillars[k] ? (result.pillars[k]!.stemTenGod ?? r.dayMaster) : ''}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  label: { color: '#6f625a' },
  input: { borderWidth: 1, borderColor: '#e6dccf', borderRadius: 8, padding: 10, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#e6dccf', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { borderColor: '#7a1f2b', backgroundColor: '#f3e3e1' },
  button: { backgroundColor: '#7a1f2b', borderRadius: 24, padding: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c62828' },
  pillars: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  pillar: { alignItems: 'center', flex: 1 },
  glyph: { fontSize: 30, fontWeight: '700' },
  small: { fontSize: 12, color: '#6f625a' },
});
