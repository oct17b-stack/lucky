/**
 * 起步用的城市表。正式版改为从 GeoNames 导入的数据库表（cities），支持全球搜索。
 */
export interface City {
  id: string;
  name: { th: string; 'zh-hans': string; 'zh-hant': string; en: string };
  lat: number;
  lng: number;
  timeZone: string;
  country: string;
}

const c = (
  id: string,
  th: string,
  hans: string,
  hant: string,
  en: string,
  lat: number,
  lng: number,
  timeZone: string,
  country: string,
): City => ({ id, name: { th, 'zh-hans': hans, 'zh-hant': hant, en }, lat, lng, timeZone, country });

export const CITIES: readonly City[] = [
  c('bangkok', 'กรุงเทพฯ', '曼谷', '曼谷', 'Bangkok', 13.7563, 100.5018, 'Asia/Bangkok', 'TH'),
  c('chiang-mai', 'เชียงใหม่', '清迈', '清邁', 'Chiang Mai', 18.7883, 98.9853, 'Asia/Bangkok', 'TH'),
  c('khon-kaen', 'ขอนแก่น', '孔敬', '孔敬', 'Khon Kaen', 16.4419, 102.836, 'Asia/Bangkok', 'TH'),
  c('phuket', 'ภูเก็ต', '普吉', '普吉', 'Phuket', 7.8804, 98.3923, 'Asia/Bangkok', 'TH'),
  c('hat-yai', 'หาดใหญ่', '合艾', '合艾', 'Hat Yai', 7.0086, 100.4747, 'Asia/Bangkok', 'TH'),
  c('beijing', 'ปักกิ่ง', '北京', '北京', 'Beijing', 39.9042, 116.4074, 'Asia/Shanghai', 'CN'),
  c('shanghai', 'เซี่ยงไฮ้', '上海', '上海', 'Shanghai', 31.2304, 121.4737, 'Asia/Shanghai', 'CN'),
  c('guangzhou', 'กวางโจว', '广州', '廣州', 'Guangzhou', 23.1291, 113.2644, 'Asia/Shanghai', 'CN'),
  c('shantou', 'ซัวเถา', '汕头', '汕頭', 'Shantou', 23.354, 116.682, 'Asia/Shanghai', 'CN'),
  c('hong-kong', 'ฮ่องกง', '香港', '香港', 'Hong Kong', 22.3193, 114.1694, 'Asia/Hong_Kong', 'HK'),
  c('taipei', 'ไทเป', '台北', '台北', 'Taipei', 25.033, 121.5654, 'Asia/Taipei', 'TW'),
  c('singapore', 'สิงคโปร์', '新加坡', '新加坡', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', 'SG'),
  c('kuala-lumpur', 'กัวลาลัมเปอร์', '吉隆坡', '吉隆坡', 'Kuala Lumpur', 3.139, 101.6869, 'Asia/Kuala_Lumpur', 'MY'),
  c('vientiane', 'เวียงจันทน์', '万象', '萬象', 'Vientiane', 17.9757, 102.6331, 'Asia/Vientiane', 'LA'),
  c('yangon', 'ย่างกุ้ง', '仰光', '仰光', 'Yangon', 16.8409, 96.1735, 'Asia/Yangon', 'MM'),
  c('london', 'ลอนดอน', '伦敦', '倫敦', 'London', 51.5074, -0.1278, 'Europe/London', 'GB'),
  c('new-york', 'นิวยอร์ก', '纽约', '紐約', 'New York', 40.7128, -74.006, 'America/New_York', 'US'),
  c('los-angeles', 'ลอสแอนเจลิส', '洛杉矶', '洛杉磯', 'Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles', 'US'),
  c('sydney', 'ซิดนีย์', '悉尼', '雪梨', 'Sydney', -33.8688, 151.2093, 'Australia/Sydney', 'AU'),
];

export function findCity(id: string): City | undefined {
  return CITIES.find((x) => x.id === id);
}
