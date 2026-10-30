import type { Locale, Messages } from '@lucky/content';

export type ToolKey =
  | 'dailyColor'
  | 'birthday'
  | 'horoscope'
  | 'phone'
  | 'name'
  | 'plate'
  | 'compatibility'
  | 'siamsi'
  | 'tarot'
  | 'zodiac'
  | 'wallpaper'
  | 'calendar'
  | 'bazi';

export const TOOL_PATHS: Record<ToolKey, string> = {
  dailyColor: '/daily-color',
  birthday: '/lucky-color',
  horoscope: '/horoscope',
  phone: '/phone-number',
  name: '/name',
  plate: '/license-plate',
  compatibility: '/compatibility',
  siamsi: '/siamsi',
  tarot: '/tarot',
  zodiac: '/thai-zodiac',
  wallpaper: '/wallpaper',
  calendar: '/calendar',
  bazi: '/bazi',
};

/**
 * 各语言的功能顺序：泰文以泰式命理为主，八字（ดวงจีน）放到后面；
 * 中文以八字、万年历为主。
 */
const ORDER: Record<Locale, ToolKey[]> = {
  th: ['dailyColor', 'birthday', 'horoscope', 'phone', 'name', 'plate', 'compatibility', 'siamsi', 'tarot', 'zodiac', 'wallpaper', 'calendar', 'bazi'],
  en: ['dailyColor', 'birthday', 'horoscope', 'phone', 'zodiac', 'compatibility', 'tarot', 'siamsi', 'name', 'plate', 'wallpaper', 'bazi', 'calendar'],
  'zh-hans': ['bazi', 'calendar', 'dailyColor', 'birthday', 'horoscope', 'compatibility', 'phone', 'zodiac', 'siamsi', 'tarot', 'name', 'plate', 'wallpaper'],
  'zh-hant': ['bazi', 'calendar', 'dailyColor', 'birthday', 'horoscope', 'compatibility', 'phone', 'zodiac', 'siamsi', 'tarot', 'name', 'plate', 'wallpaper'],
};

/** 页头导航只放 4 个最常用的 */
const NAV: Record<Locale, ToolKey[]> = {
  th: ['dailyColor', 'horoscope', 'phone', 'calendar'],
  en: ['dailyColor', 'horoscope', 'zodiac', 'bazi'],
  'zh-hans': ['bazi', 'calendar', 'dailyColor', 'horoscope'],
  'zh-hant': ['bazi', 'calendar', 'dailyColor', 'horoscope'],
};

export function toolOrder(locale: Locale): ToolKey[] {
  return ORDER[locale];
}

export function navTools(locale: Locale): ToolKey[] {
  return NAV[locale];
}

export function toolLabel(key: ToolKey, m: Messages, locale: Locale): string {
  switch (key) {
    case 'birthday':
      return m.nav.luckyColor;
    case 'phone':
      return m.nav.phone;
    case 'calendar':
      return m.nav.calendar;
    case 'bazi':
      return locale === 'th' || locale === 'en' ? m.thaiHome.chineseAstrology : m.nav.bazi;
    default:
      return m.nav2[key];
  }
}

/** 首页卡片的一句话说明 */
export function toolDescription(key: ToolKey, m: Messages): string {
  switch (key) {
    case 'dailyColor':
      return m.dailyColor.description;
    case 'birthday':
      return m.home.features.birthday.desc;
    case 'horoscope':
      return m.horoscope.description;
    case 'phone':
      return m.home.features.phone.desc;
    case 'name':
      return m.name.description;
    case 'plate':
      return m.plate.description;
    case 'compatibility':
      return m.compatibility.description;
    case 'siamsi':
      return m.siamsi.description;
    case 'tarot':
      return m.tarot.description;
    case 'zodiac':
      return m.zodiac.description;
    case 'wallpaper':
      return m.wallpaper.description;
    case 'calendar':
      return m.calendar.description;
    case 'bazi':
      return m.home.features.bazi.desc;
  }
}
