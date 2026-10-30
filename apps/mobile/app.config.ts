/**
 * App 配置，按 APP_VARIANT 区分两个版本（可以同时装在一台手机上）：
 * - lan：内网测试版，连 NAS（http://NAS的IP:3000），图标名带“测试”
 * - production：正式版，连正式网站（https）
 * 服务器地址由 EXPO_PUBLIC_API_URL 决定，在 eas.json 的各个 profile 里设置。
 */
import type { ConfigContext, ExpoConfig } from 'expo/config';

const variant = process.env.APP_VARIANT === 'production' ? 'production' : 'lan';
const isLan = variant === 'lan';

// 正式上线前把 com.example 换成你自己的反向域名，之后不能再改
const bundleId = isLan ? 'com.example.lucky.lan' : 'com.example.lucky';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isLan ? 'Lucky 测试' : 'Lucky',
  slug: 'lucky',
  scheme: isLan ? 'lucky-lan' : 'lucky',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: { bundleIdentifier: bundleId, supportsTablet: false },
  android: { package: bundleId },
  plugins: ['expo-router', ...(isLan ? ['./plugins/with-lan-http.js'] : [])],
  experiments: { typedRoutes: true },
  extra: { variant },
});
