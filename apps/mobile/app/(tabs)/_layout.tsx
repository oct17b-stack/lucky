import { Tabs } from 'expo-router';
import { t } from '../../lib/i18n';

/** 底部导航：今日 / 排盘 / 工具 / 我的 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#7a1f2b' }}>
      <Tabs.Screen name="index" options={{ title: t.birthday.title }} />
      <Tabs.Screen name="bazi" options={{ title: t.nav.bazi }} />
      <Tabs.Screen name="tools" options={{ title: t.nav.phone }} />
      <Tabs.Screen name="me" options={{ title: '•••' }} />
    </Tabs>
  );
}
