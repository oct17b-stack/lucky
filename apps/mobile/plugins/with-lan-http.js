/**
 * 只用于内网测试版 App：允许访问局域网里的 http://NAS的IP:3000。
 * - Android：允许明文 http（usesCleartextTraffic）
 * - iOS：只放开局域网地址（NSAllowsLocalNetworking），公网仍强制 https
 * 正式版不加载这个插件。
 */
const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

module.exports = function withLanHttp(config) {
  config = withAndroidManifest(config, (c) => {
    const app = c.modResults.manifest.application?.[0];
    if (app) app.$['android:usesCleartextTraffic'] = 'true';
    return c;
  });
  config = withInfoPlist(config, (c) => {
    c.modResults.NSAppTransportSecurity = {
      ...(c.modResults.NSAppTransportSecurity ?? {}),
      NSAllowsLocalNetworking: true,
    };
    c.modResults.NSLocalNetworkUsageDescription =
      'ใช้เชื่อมต่อเซิร์ฟเวอร์ทดสอบในเครือข่ายภายใน / Connects to the internal test server';
    return c;
  });
  return config;
};
