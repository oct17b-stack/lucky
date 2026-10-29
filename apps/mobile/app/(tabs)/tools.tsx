import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { analyzeThaiMobile, type PhoneAnalysis } from '@lucky/core';
import { t } from '../../lib/i18n';

export default function ToolsScreen() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const [error, setError] = useState(false);

  function analyze() {
    try {
      setResult(analyzeThaiMobile(value));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.phone.title}</Text>
      <TextInput style={styles.input} keyboardType="phone-pad" placeholder={t.phone.placeholder} value={value} onChangeText={setValue} />
      <Pressable style={styles.button} onPress={analyze}>
        <Text style={styles.buttonText}>{t.phone.submit}</Text>
      </Pressable>
      {error && <Text style={styles.error}>{t.phone.invalid}</Text>}
      {result && (
        <>
          <Text style={styles.sum}>
            {t.phone.sum}: {result.sum}
          </Text>
          <Text>{result.pairs.map((p) => p.pair).join('  ')}</Text>
          <Text style={styles.hint}>{t.phone.rulesPending}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e6dccf', borderRadius: 8, padding: 10, fontSize: 18 },
  button: { backgroundColor: '#7a1f2b', borderRadius: 24, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c62828' },
  sum: { fontSize: 28, fontWeight: '700', color: '#7a1f2b' },
  hint: { color: '#6f625a', fontSize: 12 },
});
