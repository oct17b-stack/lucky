// Expo SDK 52 起会自动识别 monorepo，默认配置即可解析 packages/* 下的共享包
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
