/**
 * เซียมซี 28 签。签文为本站原创（不取自任何寺庙的签诗），仅供参考娱乐。
 * 泰文为初稿，上线前由母语编辑审校。
 */
import type { Locale } from '../locales.ts';

export interface SiamsiStick {
  n: number;
  level: 'great' | 'good' | 'fair' | 'caution';
  text: Record<Locale, string>;
}

const s = (n: number, level: SiamsiStick['level'], zhs: string, zht: string, th: string, en: string): SiamsiStick => ({
  n,
  level,
  text: { 'zh-hans': zhs, 'zh-hant': zht, th, en },
});

export const SIAMSI: readonly SiamsiStick[] = [
  s(1, 'great', '旭日东升，所求皆顺。工作有贵人提携，财运渐旺，宜把握时机。', '旭日東升，所求皆順。工作有貴人提攜，財運漸旺，宜把握時機。', 'ดั่งตะวันขึ้นยามเช้า สิ่งที่ปรารถนาราบรื่น การงานมีผู้ใหญ่ช่วยเหลือ การเงินค่อย ๆ ดีขึ้น ควรคว้าโอกาสไว้', 'Like the rising sun, your wishes go smoothly. A mentor helps at work and money improves. Seize the moment.'),
  s(2, 'good', '春雨润物，好事慢慢来。耐心经营，三个月内可见成果。', '春雨潤物，好事慢慢來。耐心經營，三個月內可見成果。', 'ดั่งฝนต้นฤดูชุ่มชื่นแผ่นดิน เรื่องดีจะค่อย ๆ มา อดทนทำต่อไป ภายในสามเดือนจะเห็นผล', 'Like spring rain, good things come slowly. Keep at it and you will see results within three months.'),
  s(3, 'fair', '船到江心，进退两难。先稳住手上的事，不宜换工作或大笔投资。', '船到江心，進退兩難。先穩住手上的事，不宜換工作或大筆投資。', 'ดั่งเรือกลางแม่น้ำ จะไปต่อหรือถอยก็ลำบาก ควรรักษาสิ่งที่มีอยู่ ยังไม่ควรเปลี่ยนงานหรือลงทุนก้อนใหญ่', 'A boat mid-river, hard to go on or turn back. Hold steady; this is no time to change jobs or make big investments.'),
  s(4, 'good', '花开有时，姻缘渐近。单身者多参加聚会，有伴者宜多陪伴。', '花開有時，姻緣漸近。單身者多參加聚會，有伴者宜多陪伴。', 'ดอกไม้บานตามฤดู เนื้อคู่ใกล้เข้ามา คนโสดควรออกไปพบปะผู้คน คนมีคู่ควรใช้เวลาร่วมกันให้มาก', 'Flowers bloom in their season and love draws near. If single, go out and meet people; if paired, spend more time together.'),
  s(5, 'caution', '乌云遮月，小人在侧。说话要谨慎，文件合同仔细核对。', '烏雲遮月，小人在側。說話要謹慎，文件合同仔細核對。', 'เมฆบังจันทร์ มีคนคิดร้ายอยู่ใกล้ตัว ระวังคำพูด และตรวจเอกสารสัญญาให้ละเอียด', 'Clouds hide the moon and someone nearby means you harm. Watch your words and check contracts carefully.'),
  s(6, 'great', '金鲤跃门，喜事临门。考试、升职、开业皆有好消息。', '金鯉躍門，喜事臨門。考試、升職、開業皆有好消息。', 'ปลาทองกระโดดข้ามประตูมังกร มีข่าวดีเข้าบ้าน ทั้งการสอบ การเลื่อนตำแหน่ง และการเปิดกิจการ', 'A golden carp leaps the gate and good news arrives: exams, promotions and new businesses all go well.'),
  s(7, 'fair', '山路弯弯，终能到顶。目标没错，只是要多花些时间。', '山路彎彎，終能到頂。目標沒錯，只是要多花些時間。', 'ทางขึ้นเขาคดเคี้ยว แต่ก็ถึงยอดได้ เป้าหมายถูกต้องแล้ว เพียงต้องใช้เวลามากขึ้น', 'The mountain path winds but reaches the top. Your goal is right; it just takes longer.'),
  s(8, 'good', '贵人相助，困难化解。遇到难题不妨开口求助。', '貴人相助，困難化解。遇到難題不妨開口求助。', 'มีผู้อุปถัมภ์ช่วยคลี่คลายปัญหา หากติดขัดอย่าลังเลที่จะขอความช่วยเหลือ', 'A helper appears and difficulties ease. When stuck, do not hesitate to ask.'),
  s(9, 'caution', '雨夜行路，宜缓不宜急。健康要留意，出行注意安全。', '雨夜行路，宜緩不宜急。健康要留意，出行注意安全。', 'เดินทางยามค่ำคืนฝนตก ควรช้าแต่มั่นคง ระวังสุขภาพ และระมัดระวังการเดินทาง', 'Walking on a rainy night: go slowly. Mind your health and travel with care.'),
  s(10, 'good', '种瓜得瓜，付出有回报。勤勉之事近期见成效。', '種瓜得瓜，付出有回報。勤勉之事近期見成效。', 'ปลูกสิ่งใดได้สิ่งนั้น ความเพียรที่ลงไปจะเห็นผลในไม่ช้า', 'You reap what you sow. Your hard work will show results soon.'),
  s(11, 'fair', '月有圆缺，财来财去。收支要记账，暂不宜借钱给人。', '月有圓缺，財來財去。收支要記帳，暫不宜借錢給人。', 'พระจันทร์มีข้างขึ้นข้างแรม เงินมาแล้วก็ไป ควรจดรายรับรายจ่าย และยังไม่ควรให้ใครยืมเงิน', 'The moon waxes and wanes, and so does money. Track your spending and avoid lending money for now.'),
  s(12, 'great', '凤凰来仪，家宅兴旺。家中有喜，适合添丁、置业、办喜事。', '鳳凰來儀，家宅興旺。家中有喜，適合添丁、置業、辦喜事。', 'หงส์มาเยือน บ้านเรือนรุ่งเรือง มีเรื่องน่ายินดีในครอบครัว เหมาะกับการมีบุตร ซื้อบ้าน หรือจัดงานมงคล', 'A phoenix visits and the household flourishes. Good for children, buying a home and celebrations.'),
  s(13, 'fair', '风平浪静，守成为上。维持现状比冒险更好。', '風平浪靜，守成為上。維持現狀比冒險更好。', 'ลมสงบคลื่นนิ่ง รักษาสิ่งที่มีไว้ดีกว่าเสี่ยง', 'Calm winds and still water: keeping what you have is better than taking risks.'),
  s(14, 'good', '远方来信，机会在外。出差、旅行、与外地人合作有利。', '遠方來信，機會在外。出差、旅行、與外地人合作有利。', 'มีข่าวจากแดนไกล โอกาสอยู่นอกบ้าน การเดินทางและการร่วมงานกับคนต่างถิ่นจะเป็นผลดี', 'News from afar: opportunity lies outside. Travel and working with people from elsewhere bring luck.'),
  s(15, 'caution', '口舌是非，宜静不宜动。避免争吵，退一步海阔天空。', '口舌是非，宜靜不宜動。避免爭吵，退一步海闊天空。', 'มีเรื่องขัดแย้งทางวาจา ควรอยู่นิ่งมากกว่าเคลื่อนไหว หลีกเลี่ยงการทะเลาะ ถอยหนึ่งก้าวแล้วทุกอย่างจะดีขึ้น', 'Quarrels are in the air. Stay quiet; step back from arguments and things will open up.'),
  s(16, 'good', '枯木逢春，转机已到。曾经的不顺即将好转。', '枯木逢春，轉機已到。曾經的不順即將好轉。', 'ไม้แห้งผลิใบใหม่ จุดเปลี่ยนมาถึงแล้ว เรื่องที่เคยติดขัดกำลังจะดีขึ้น', 'A dry tree buds in spring. The turning point has come and old troubles will ease.'),
  s(17, 'fair', '雾里看花，真相未明。重要决定先多打听，再下结论。', '霧裡看花，真相未明。重要決定先多打聽，再下結論。', 'มองดอกไม้ผ่านหมอก ความจริงยังไม่ชัด ก่อนตัดสินใจเรื่องสำคัญควรหาข้อมูลให้มากก่อน', 'Flowers seen through fog: the truth is unclear. Gather more facts before any big decision.'),
  s(18, 'great', '满载而归，财源广进。生意兴隆，适合投资和签约。', '滿載而歸，財源廣進。生意興隆，適合投資和簽約。', 'กลับบ้านพร้อมของเต็มลำเรือ เงินทองไหลมาเทมา การค้ารุ่งเรือง เหมาะกับการลงทุนและเซ็นสัญญา', 'Returning with a full load: money flows in. Business thrives; a good time to invest and sign.'),
  s(19, 'good', '和气生财，人缘为宝。与人为善，自然有人相助。', '和氣生財，人緣為寶。與人為善，自然有人相助。', 'ความเป็นมิตรนำมาซึ่งโชคลาภ มนุษยสัมพันธ์คือสมบัติ ทำดีกับผู้อื่นแล้วจะมีคนช่วยเหลือ', 'Friendliness brings fortune and goodwill is treasure. Be kind and help will come.'),
  s(20, 'caution', '急水行舟，欲速不达。不要贪快，先把基础打牢。', '急水行舟，欲速不達。不要貪快，先把基礎打牢。', 'พายเรือในกระแสน้ำเชี่ยว ยิ่งรีบยิ่งช้า อย่าใจร้อน วางรากฐานให้มั่นคงก่อน', 'Rowing against a rapid current: haste slows you down. Build a solid base first.'),
  s(21, 'good', '学而有成，智慧增长。适合进修、考证、学新技能。', '學而有成，智慧增長。適合進修、考證、學新技能。', 'การเรียนรู้ผลิดอกออกผล สติปัญญาเพิ่มพูน เหมาะกับการศึกษาต่อ สอบใบประกอบวิชาชีพ หรือฝึกทักษะใหม่', 'Learning bears fruit. A good time for study, certifications and new skills.'),
  s(22, 'fair', '半晴半雨，喜忧参半。好消息和小麻烦同时出现，平常心对待。', '半晴半雨，喜憂參半。好消息和小麻煩同時出現，平常心對待。', 'ฟ้าครึ้มสลับแดด สุขทุกข์ปะปนกัน ข่าวดีและเรื่องกวนใจมาพร้อมกัน ทำใจให้สบาย', 'Half sun, half rain: good news and small troubles arrive together. Take both calmly.'),
  s(23, 'good', '家和万事兴。多关心家人，家里顺了外面也顺。', '家和萬事興。多關心家人，家裡順了外面也順。', 'บ้านสงบสุข ทุกอย่างก็เจริญ ใส่ใจคนในครอบครัว เมื่อในบ้านราบรื่น เรื่องนอกบ้านก็ราบรื่นตาม', 'A harmonious home makes everything prosper. Care for your family and the rest follows.'),
  s(24, 'caution', '暗礁在前，谨慎驾驶。投资、借贷、担保都要三思。', '暗礁在前，謹慎駕駛。投資、借貸、擔保都要三思。', 'มีโขดหินใต้น้ำอยู่ข้างหน้า ต้องประคองเรือให้ดี การลงทุน การกู้ยืม และการค้ำประกันต้องคิดให้รอบคอบ', 'Hidden rocks ahead: steer carefully. Think twice about investing, borrowing or guaranteeing loans.'),
  s(25, 'great', '众星拱月，名声远扬。工作表现被看见，适合争取更大的舞台。', '眾星拱月，名聲遠揚。工作表現被看見，適合爭取更大的舞台。', 'ดวงดาวล้อมดวงจันทร์ ชื่อเสียงขจรไกล ผลงานเป็นที่ประจักษ์ ควรก้าวไปสู่เวทีที่ใหญ่ขึ้น', 'Stars circle the moon and your name spreads. Your work is noticed; reach for a bigger stage.'),
  s(26, 'fair', '旧事重提，宜做了结。把拖着的事情处理掉，心里会轻松。', '舊事重提，宜做了結。把拖著的事情處理掉，心裡會輕鬆。', 'เรื่องเก่ากลับมาอีกครั้ง ควรสะสางให้จบ เมื่อจัดการเรื่องค้างคาได้ ใจจะเบาสบาย', 'Old matters return; settle them. Clearing what has dragged on will lighten your heart.'),
  s(27, 'good', '顺风扬帆，行动有利。计划已久的事可以开始了。', '順風揚帆，行動有利。計劃已久的事可以開始了。', 'ลมส่งท้ายเรือ ลงมือทำได้ดี เรื่องที่วางแผนมานานเริ่มได้แล้ว', 'A tailwind fills your sails. Start what you have long been planning.'),
  s(28, 'fair', '静待花开，时机未到。先做准备，下个月再行动更好。', '靜待花開，時機未到。先做準備，下個月再行動更好。', 'รอดอกไม้บานอย่างใจเย็น ยังไม่ถึงเวลา เตรียมตัวไว้ก่อน แล้วค่อยลงมือในเดือนหน้า', 'Wait for the flowers to open; the time is not yet. Prepare now and act next month.'),
];
