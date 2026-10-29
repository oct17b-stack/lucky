import { StyleSheet, Text, View } from 'react-native';

/**
 * 我的：阶段 1 接入登录（邮箱、Google、Apple、LINE），
 * 阶段 2 接入 RevenueCat 订阅、恢复购买和应用内删除账号（Apple 审核要求）。
 */
export default function MeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.hint}>Login, saved charts and subscription arrive in phase 1–2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  hint: { color: '#6f625a' },
});
