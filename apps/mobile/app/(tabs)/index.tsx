import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { thaiBirthDay } from '@lucky/core';
import { API_URL, deviceLocale, t } from '../../lib/i18n';

/** 今日：显示今天对应的星期色，并检查与后端（NAS 测试版）的连接 */
export default function TodayScreen() {
  const now = new Date();
  const today = thaiBirthDay(
    { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: 12, minute: 0 },
    { dayStartsAtSunrise: false },
  );
  const [server, setServer] = useState<string>('…');

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((j: { env: string; engine: string }) => setServer(`${j.env} · engine ${j.engine}`))
      .catch(() => setServer('offline'));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{today.name[deviceLocale]}</Text>
      <View style={[styles.swatch, { backgroundColor: today.color.hex }]} />
      <Text style={styles.label}>{t.birthday.color}</Text>
      <Text style={styles.value}>{deviceLocale === 'th' ? today.color.th : today.color.en}</Text>
      <Text style={styles.label}>{t.birthday.buddha}</Text>
      <Text style={styles.value}>{today.buddha.th}</Text>
      <Text style={styles.footer}>API: {server}</Text>
      <Text style={styles.footer}>{t.common.disclaimer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  swatch: { width: 96, height: 96, borderRadius: 48, marginVertical: 16 },
  label: { color: '#6f625a', marginTop: 8 },
  value: { fontSize: 18, fontWeight: '600' },
  footer: { color: '#6f625a', fontSize: 12, marginTop: 24 },
});
