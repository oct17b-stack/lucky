/**
 * 泰式数字含义（通行说法）：手机号数字对、手机号总和、名字/车牌总和。
 *
 * 编制方法：比对 31 个泰国来源（Thairath、Sanook、Central、Khaosod、teenee、simdeedonjai、
 * berchokdee、decoder159、alottechs、mahamodo 表、boonbaramee、theluckyname、Dumex 等），
 * 同一作者的转载只算一次；吉凶取多数来源的说法（过半），没有过半的记为“吉凶参半”（mixed）。
 * agree 字段记录“好/坏/参半/来源总数”，便于以后由命理顾问复核。
 * 泰文为来源说法的简短转述，中英文为对应翻译。
 */
import type { Locale } from '../locales.ts';

export type NumberTone = 'good' | 'bad' | 'mixed';
export type NumberTopic = 'money' | 'work' | 'love' | 'health' | 'luck' | 'speech' | 'wisdom' | 'patron' | 'stress';

export interface NumberMeaning {
  tone: NumberTone;
  topics: NumberTopic[];
  meaning: Record<Locale, string>;
  /** 来源统计：好/坏/参半/总数 */
  agree: string;
}

type Row = [keys: string, tone: NumberTone, topics: string, agree: string, th: string, zhs: string, zht: string, en: string];

function build(rows: Row[]): Record<string, NumberMeaning> {
  const out: Record<string, NumberMeaning> = {};
  for (const [keys, tone, topics, agree, th, zhs, zht, en] of rows) {
    const value: NumberMeaning = {
      tone,
      topics: topics ? (topics.split(',') as NumberTopic[]) : [],
      meaning: { th, 'zh-hans': zhs, 'zh-hant': zht, en },
      agree,
    };
    for (const k of keys.split(',')) out[k] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// A. 数字对 00–99（正反同义）
// ---------------------------------------------------------------------------
const PAIRS: Row[] = [
  ['00', 'bad', 'health,stress', '1/5/0/6', 'โลกส่วนตัวสูง เก็บตัว บางตำราว่าเกี่ยวกับโรคภัย', '个性孤僻、封闭，有说法认为与疾病有关', '個性孤僻、封閉，有說法認為與疾病有關', 'Withdrawn and private; some say it brings illness'],
  ['01,10', 'bad', 'stress,work', '0/6/1/7', 'ใจร้อน ไม่ยอมอยู่ใต้ใคร ถูกโกงหรือหักหลังง่าย', '性急，不愿屈居人下，易被欺骗或背叛', '性急，不願屈居人下，易被欺騙或背叛', 'Hot-headed and hard to manage; prone to being cheated'],
  ['02,20', 'bad', 'love,money', '0/7/0/7', 'เสน่ห์แรงแต่รักซ้อน ระวังเป็นมือที่สาม เงินรั่วไหล', '桃花旺但易多角恋，钱财外流', '桃花旺但易多角戀，錢財外流', 'Strong charm but tangled love lives; money leaks away'],
  ['03,30', 'bad', 'stress,speech', '0/7/0/7', 'อารมณ์ร้อนรุนแรง มีปากเสียงกับผู้อื่นง่าย', '脾气暴躁，容易与人争吵', '脾氣暴躁，容易與人爭吵', 'Fiery temper; quarrels come easily'],
  ['04,40', 'bad', 'speech,work', '1/4/1/6', 'ไหวพริบดี รู้ความลับคนอื่น แต่มักฉลาดแกมโกง', '机灵、知人隐私，但易耍小聪明', '機靈、知人隱私，但易耍小聰明', 'Quick-witted and knows secrets, but tends to be crafty'],
  ['05,50', 'mixed', 'wisdom', '2/3/1/6', 'คิดเอง พิสูจน์เอง รักความยุติธรรม สนใจศาสนา', '凡事亲自求证，重公正，亲近宗教', '凡事親自求證，重公正，親近宗教', 'Independent thinker who values fairness and faith'],
  ['06,60', 'bad', 'money,love', '1/6/0/7', 'รักสบาย ใช้เงินเกินตัว รักซ้อน เงินรั่ว', '贪图享乐，入不敷出，感情复杂', '貪圖享樂，入不敷出，感情複雜', 'Loves comfort and overspends; complicated love'],
  ['07,70', 'bad', 'health,stress', '0/7/0/7', 'เคร่งเครียด แบกภาระหนัก อมทุกข์', '压力大，负担重，心事重重', '壓力大，負擔重，心事重重', 'Heavy burdens and constant stress'],
  ['08,80', 'bad', 'money,stress', '0/6/1/7', 'ใจนักเลง กล้าเสี่ยง หูเบา รายจ่ายสูง', '豪爽好冒险，耳根软，开销大', '豪爽好冒險，耳根軟，開銷大', 'Bold risk-taker, easily swayed, high spending'],
  ['09,90', 'mixed', 'luck,stress', '1/2/2/5', 'ลางสังหรณ์แรง อารมณ์ขึ้นลง ชอบอยู่คนเดียว', '直觉强，情绪起伏，喜独处', '直覺強，情緒起伏，喜獨處', 'Strong intuition, moody, likes solitude'],
  ['11', 'bad', 'work,stress', '0/4/1/5', 'อยากเด่นดังเป็นผู้นำ แต่ใจร้อน โดดเด่นแต่เป็นภัย', '想出头当领袖，但性急，出众反招祸', '想出頭當領袖，但性急，出眾反招禍', 'Wants the spotlight but is rash; standing out invites trouble'],
  ['12,21', 'bad', 'stress', '0/6/0/6', 'อารมณ์สองขั้ว เปลี่ยนใจบ่อย สับสน', '情绪两极，常改变主意', '情緒兩極，常改變主意', 'Mood swings and frequent changes of mind'],
  ['13,31', 'bad', 'health,stress', '0/7/1/8', 'ใจร้อน ตัดสินใจเร็ว ระวังอุบัติเหตุ การผ่าตัด และการทะเลาะ', '性急冲动，防意外、手术和争吵', '性急衝動，防意外、手術和爭吵', 'Impulsive; watch for accidents, surgery and fights'],
  ['14,41', 'good', 'speech,work,patron', '6/1/0/7', 'ผู้ใหญ่เมตตา พูดจาน่าเชื่อถือ เจรจาเก่ง', '得长辈赏识，说话有信服力，善谈判', '得長輩賞識，說話有信服力，善談判', 'Favored by seniors; persuasive and good at negotiating'],
  ['15,51', 'good', 'wisdom,work,patron', '8/0/0/8', 'สติปัญญาดี มีเหตุผล มีผู้ใหญ่อุปถัมภ์และเพื่อนดี', '聪明理性，有贵人和好友相助', '聰明理性，有貴人和好友相助', 'Clever and reasonable, with good mentors and friends'],
  ['16,61', 'good', 'money,work', '6/0/0/6', 'มองการณ์ไกล วางแผนเก่ง เก็บเงินเป็น', '有远见，善规划，懂储蓄', '有遠見，善規劃，懂儲蓄', 'Far-sighted planner who knows how to save'],
  ['17,71', 'bad', 'work,stress', '1/4/1/6', 'ขยันทุ่มเทแต่เครียดและกดดัน ใจร้อน เผด็จการ', '拼命工作却压力大，性急专断', '拼命工作卻壓力大，性急專斷', 'Works hard under heavy pressure; impatient and controlling'],
  ['18,81', 'bad', 'stress,love,work', '1/4/1/6', 'เจ้าอารมณ์ เผด็จการ เสี่ยงถูกหักหลัง', '情绪化、专断，易遭背叛', '情緒化、專斷，易遭背叛', 'Temperamental and domineering; risk of betrayal'],
  ['19,91', 'good', 'work,luck', '7/0/0/7', 'เป็นผู้นำ โดดเด่น มีชื่อเสียง เงินและโชคเข้ามา', '领导力强，出众有名，财运与好运并来', '領導力強，出眾有名，財運與好運並來', 'A standout leader; fame, money and luck arrive'],
  ['22', 'good', 'love', '6/0/1/7', 'อ่อนโยน ใจดี มีเสน่ห์ แต่ระวังหูเบา', '温柔善良有魅力，但耳根软', '溫柔善良有魅力，但耳根軟', 'Gentle, kind and charming, if a little easily swayed'],
  ['23,32', 'good', 'love,money', '6/1/1/8', 'เสน่ห์แรง ดึงดูดทั้งผู้คนและทรัพย์', '魅力强，吸引人缘与财富', '魅力強，吸引人緣與財富', 'Magnetic charm that attracts people and money'],
  ['24,42', 'good', 'love,money,speech', '8/0/0/8', 'เมตตามหานิยม เจรจาดี เงินคล่อง ความรักราบรื่น', '人见人爱，善言辞，财务宽裕，感情顺', '人見人愛，善言辭，財務寬裕，感情順', 'Well liked and articulate; money flows and love goes smoothly'],
  ['25,52', 'mixed', 'work,patron', '1/2/3/6', 'สร้างตัวด้วยสติปัญญา แต่มักขัดแย้งกับผู้ใหญ่', '靠智慧立身，但易与长辈冲突', '靠智慧立身，但易與長輩衝突', 'Self-made through intelligence, but clashes with seniors'],
  ['26,62', 'good', 'speech,money,love', '7/1/0/8', 'มีเสน่ห์ทางคำพูด วาจาเป็นทรัพย์', '口才有魅力，言语生财', '口才有魅力，言語生財', 'Charming speech that brings in money'],
  ['27,72', 'bad', 'money', '1/6/0/7', 'หนี้สิน รายจ่ายเกินตัว หามาได้แต่ไม่ได้ใช้', '负债，开销过大，赚了钱也留不住', '負債，開銷過大，賺了錢也留不住', 'Debt and overspending; money earned slips away'],
  ['28,82', 'good', 'money', '5/2/1/8', 'บริหารเงินก้อนโต หาเงินเก่ง แต่ระวังการเสี่ยง', '善于理财、赚大钱，但要防冒险', '善於理財、賺大錢，但要防冒險', 'Handles big money well; beware of risky bets'],
  ['29,92', 'good', 'love,wisdom,money', '7/0/0/7', 'ความคิดสร้างสรรค์ มีศิลปะ มนุษยสัมพันธ์ดี มีเสน่ห์', '富创意与艺术感，人缘好有魅力', '富創意與藝術感，人緣好有魅力', 'Creative and artistic, with charm and good relationships'],
  ['33', 'mixed', 'work,stress', '1/2/3/6', 'นักสู้ บ้าพลัง ขาลุย แต่อารมณ์ร้อน', '斗志旺盛、敢冲，但脾气急', '鬥志旺盛、敢衝，但脾氣急', 'A tireless fighter, but hot-tempered'],
  ['34,43', 'bad', 'speech', '0/5/1/6', 'ปากจัด พูดตรงแรง ปากพาจนและสร้างศัตรู', '说话尖锐直接，祸从口出', '說話尖銳直接，禍從口出', 'Sharp tongue that makes enemies and costs money'],
  ['35,53', 'good', 'work,patron', '7/0/0/7', 'อำนาจบารมี เลื่อนขั้นเลื่อนตำแหน่ง มีผู้ใหญ่หนุน', '有威望，易升迁，长辈支持', '有威望，易升遷，長輩支持', 'Authority and promotion, backed by seniors'],
  ['36,63', 'good', 'love,money', '8/1/0/9', 'เสน่ห์แรง หาเงินคล่อง ผู้ใหญ่ช่วย ความรักดี', '魅力强，财路顺，有贵人，感情好', '魅力強，財路順，有貴人，感情好', 'Strong charm, easy money, helpful seniors, good love'],
  ['37,73', 'bad', 'health,stress,love', '0/8/0/8', 'อุปสรรค กดดัน ระวังอุบัติเหตุ ความรักไม่สมหวัง', '多阻碍压力，防意外，感情不顺', '多阻礙壓力，防意外，感情不順', 'Obstacles and pressure; accidents and unhappy love'],
  ['38,83', 'bad', 'stress,luck', '0/5/2/7', 'ใจร้อนบ้าบิ่น ตัดสินใจด้วยอารมณ์', '鲁莽冲动，凭情绪做决定', '魯莽衝動，憑情緒做決定', 'Reckless decisions made in the heat of the moment'],
  ['39,93', 'good', 'luck,work', '6/0/0/6', 'โชคในการแข่งขัน แข่งกี่ครั้งก็ชนะ', '竞争运旺，逢赛必胜', '競爭運旺，逢賽必勝', 'Luck in competition: you keep winning'],
  ['44', 'good', 'speech,money', '7/0/0/7', 'ช่างพูดช่างเจรจา ฉลาด ทันข่าว เงินเข้าไม่ขาด', '能说会道，消息灵通，财源不断', '能說會道，消息靈通，財源不斷', 'Eloquent and well informed; steady income'],
  ['45,54', 'good', 'wisdom,luck,money', '7/0/0/7', 'ฉลาด เรียนเก่ง คู่แห่งความสำเร็จและโชค', '聪明好学，成功与好运之对', '聰明好學，成功與好運之對', 'Bright and studious: the pair of success and luck'],
  ['46,64', 'good', 'money,speech,love', '6/0/0/6', 'วาจาเรียกทรัพย์ ร่าเริง หาเงินได้หลายทาง', '口才生财，开朗，财路多', '口才生財，開朗，財路多', 'Cheerful talker with many ways to earn'],
  ['47,74', 'mixed', 'work,speech,stress', '2/0/4/6', 'พูดจริงทำจริง น่าเชื่อถือ เป็นนักสู้ แต่เครียดง่าย', '言出必行可信赖，但易紧张', '言出必行可信賴，但易緊張', 'Trustworthy and true to their word, but stressed'],
  ['48,84', 'bad', 'stress,speech', '0/6/0/6', 'ปัญหาเอกสาร สัญญา คดีความ การค้ำประกัน', '文件、合同、官司、担保方面易出问题', '文件、合約、官司、擔保方面易出問題', 'Trouble with documents, contracts, lawsuits and guarantees'],
  ['49,94', 'good', 'work,wisdom', '7/0/0/7', 'คิดเร็วทำเร็ว ทันสมัย ไหวพริบดี', '思维敏捷，行动快，跟得上时代', '思維敏捷，行動快，跟得上時代', 'Quick thinker and doer, modern and sharp'],
  ['55', 'good', 'work,wisdom', '7/0/0/7', 'มีหลักการ ใจเย็น ชีวิตรุ่งโรจน์', '有原则，沉稳，前途光明', '有原則，沉穩，前途光明', 'Principled and calm, with a bright future'],
  ['56,65', 'good', 'money,luck,love', '6/0/0/6', 'คู่ทรัพย์คู่โชค การเงินดี ความรักสมหวัง', '财运与好运之对，财务好，感情如意', '財運與好運之對，財務好，感情如意', 'The pair of wealth and luck; money and love go well'],
  ['57,75', 'bad', 'stress,love', '0/4/1/5', 'ดื้อรั้น ขัดแย้งกับผู้อื่น เครียดสูง', '固执，易与人冲突，压力大', '固執，易與人衝突，壓力大', 'Stubborn and conflict-prone, under heavy stress'],
  ['58,85', 'bad', 'work,health', '0/4/1/5', 'ฉลาดมีเล่ห์เหลี่ยม แต่ดึงดูดปัญหา ชีวิตผันผวน', '聪明有心计，却招惹麻烦，起伏大', '聰明有心計，卻招惹麻煩，起伏大', 'Clever and crafty, but attracts trouble; an unsteady life'],
  ['59,95', 'good', 'luck', '6/0/0/6', 'สิ่งศักดิ์สิทธิ์คุ้มครอง มีโชคลาภ ลางสังหรณ์แม่น', '有神明护佑，有偏财，直觉准', '有神明護佑，有偏財，直覺準', 'Protected by the sacred; luck and sharp intuition'],
  ['66', 'good', 'love,money', '6/0/0/6', 'เสน่ห์ดีมาก หาเงินเก่ง การเงินคล่องตัว', '魅力极佳，善于赚钱，资金宽裕', '魅力極佳，善於賺錢，資金寬裕', 'Very charming and good at making money'],
  ['67,76', 'bad', 'money,love', '0/5/0/5', 'การเงินฝืด มีหนี้ ความรักพลัดพราก', '资金紧，有负债，感情易分离', '資金緊，有負債，感情易分離', 'Tight money, debt and separation in love'],
  ['68,86', 'bad', 'money,love', '1/3/1/5', 'ฟุ่มเฟือย ลุ่มหลงในเงินหรือความรัก', '奢侈，沉迷于钱财或感情', '奢侈，沉迷於錢財或感情', 'Extravagant and infatuated with money or love'],
  ['69,96', 'good', 'money,work', '4/0/1/5', 'หาเงินง่าย หมุนเงินคล่อง มีชื่อเสียง ไม่ควรอยู่ท้ายเบอร์', '赚钱容易，资金周转灵活，有名气；不宜放在号码最后', '賺錢容易，資金週轉靈活，有名氣；不宜放在號碼最後', 'Easy money and fame, but it should not be the last pair'],
  ['77', 'bad', 'stress,work', '0/5/0/5', 'อุปสรรครุมเร้า เครียด กดดันสูง', '阻碍重重，压力极大', '阻礙重重，壓力極大', 'Obstacles pile up under intense pressure'],
  ['78,87', 'good', 'money,patron', '5/0/1/6', 'มีมิตรใหญ่และผู้ช่วย ขยายกิจการ มีที่ดิน ฐานะมั่งคั่ง', '有贵人助力，事业扩张，置产致富', '有貴人助力，事業擴張，置產致富', 'Powerful allies, growing business and property'],
  ['79,97', 'good', 'work,luck', '3/0/1/4', 'มองการณ์ไกล มีวิสัยทัศน์ ความคิดดี สัมผัสที่หก', '有远见与创意，第六感强', '有遠見與創意，第六感強', 'Visionary ideas and a strong sixth sense'],
  ['88', 'mixed', 'work,money', '1/0/3/4', 'มีอำนาจและเงินทอง กล้าได้กล้าเสีย แต่ใช้เงินมาก', '有权有钱，敢拼敢输，但花费大', '有權有錢，敢拼敢輸，但花費大', 'Power and money, bold play, heavy spending'],
  ['89,98', 'good', 'work,patron', '6/0/1/7', 'อำนาจบารมี เหมาะกับผู้บริหาร แคล้วคลาดปลอดภัย', '有威望，适合管理者，逢凶化吉', '有威望，適合管理者，逢凶化吉', 'Authority suited to leaders; kept safe from harm'],
  ['99', 'good', 'luck', '7/0/0/7', 'เลขคู่ปาฏิหาริย์ สิ่งศักดิ์สิทธิ์คุ้มครอง ประสบความสำเร็จ', '奇迹之数，神明护佑，成就事业', '奇蹟之數，神明護佑，成就事業', 'The miracle pair: sacred protection and success'],
];

// ---------------------------------------------------------------------------
// B. 号码/数字总和 9–81（来源：mahamodo 表、Thairath、Central、boonbaramee、s-momclub 等）
// ---------------------------------------------------------------------------
const SUMS: Row[] = [
  ['9', 'mixed', '', '2/1/1/4', 'บางตำราว่าเป็นเลขมงคล บางตำราว่าตัดสินใจตามอารมณ์', '有说吉祥，也有说易感情用事', '有說吉祥，也有說易感情用事', 'Lucky to some, emotional decisions to others'],
  ['10', 'mixed', '', '2/1/1/4', 'ชอบความท้าทาย มั่นใจ แต่มีอุปสรรคและศัตรู', '喜挑战、自信，但有阻碍与对手', '喜挑戰、自信，但有阻礙與對手', 'Confident and loves a challenge, but meets opposition'],
  ['11', 'mixed', '', '0/2/2/4', 'หลงตัวเอง ดื้อ เชื่อคนง่าย', '自负固执，易轻信他人', '自負固執，易輕信他人', 'Self-absorbed, stubborn and too trusting'],
  ['12', 'mixed', '', '0/1/3/4', 'ถือตัว หูเบา เจ็บแล้วไม่จำ', '清高、耳根软，吃亏不长记性', '清高、耳根軟，吃虧不長記性', 'Proud and easily swayed; does not learn from hurt'],
  ['13', 'mixed', '', '0/2/3/5', 'ดีร้ายเกิดขึ้นฉับพลัน ความรักไม่ค่อยสมหวัง', '吉凶来得突然，感情难如意', '吉凶來得突然，感情難如意', 'Sudden ups and downs; love rarely goes to plan'],
  ['14', 'good', 'wisdom,work', '7/0/0/7', 'ฉลาด งานก้าวหน้า ติดต่อต่างประเทศ เหมาะกับนักพูดนักเขียน', '聪明，事业进步，利对外联系，宜演讲写作', '聰明，事業進步，利對外聯繫，宜演講寫作', 'Clever and progressing; good for foreign dealings, speaking and writing'],
  ['15', 'good', 'love,patron', '7/0/0/7', 'มีเพื่อนมาก มีเสน่ห์ มีคนคอยช่วยเหลือ', '朋友多，有魅力，常有人帮', '朋友多，有魅力，常有人幫', 'Many friends, charm and helpers'],
  ['16', 'mixed', '', '2/3/1/6', 'ตำราเดิมว่ามีอุปสรรค สื่อด้านเบอร์ว่างานก้าวหน้า', '传统说法多阻碍，号码类媒体则说事业进步', '傳統說法多阻礙，號碼類媒體則說事業進步', 'Old tables say obstacles; phone guides say progress'],
  ['17', 'mixed', '', '0/2/3/5', 'สติปัญญาดี แต่ชีวิตขึ้นลงและถูกกดดัน', '聪明，但人生起伏、受压', '聰明，但人生起伏、受壓', 'Intelligent, but life goes up and down under pressure'],
  ['18', 'bad', '', '1/3/0/4', 'อยู่ไม่ติดที่ มีการเปลี่ยนแปลงกะทันหัน', '居无定所，变化突然', '居無定所，變化突然', 'Restless, with sudden changes'],
  ['19', 'good', 'work', '5/0/1/6', 'ได้รับการยอมรับ เสริมสิริมงคล', '受人认可，增添吉祥', '受人認可，增添吉祥', 'Recognition and good fortune'],
  ['20', 'good', 'patron', '3/0/1/4', 'สำเร็จด้วยการสนับสนุนจากผู้อื่น', '靠他人支持而成功', '靠他人支持而成功', 'Success through others’ support'],
  ['21', 'mixed', '', '0/0/4/4', 'มีเสน่ห์ เด็ดเดี่ยว แต่ไม่ค่อยสมหวัง', '有魅力、果断，但不太如意', '有魅力、果斷，但不太如意', 'Charming and decisive, but wishes often fall short'],
  ['22', 'mixed', '', '3/2/1/6', 'ตำราเดิมว่าเพ้อฝันถูกหลอก สื่อด้านเบอร์ว่าเสน่ห์และความรัก', '传统说爱幻想易受骗，号码类媒体说魅力与爱情', '傳統說愛幻想易受騙，號碼類媒體說魅力與愛情', 'Old tables say dreamy and gullible; phone guides say charm and love'],
  ['23', 'good', 'love,patron', '3/0/1/4', 'คนรอบตัวชื่นชอบ มีผู้ใหญ่ช่วยเหลือ', '人缘好，有长辈帮助', '人緣好，有長輩幫助', 'Liked by those around you, helped by seniors'],
  ['24', 'good', 'love,work,money', '5/0/1/6', 'เมตตามหานิยม มีเพื่อน งานก้าวหน้า การเงินดี', '人见人爱，朋友多，事业财运佳', '人見人愛，朋友多，事業財運佳', 'Well liked, with friends, progress and money'],
  ['25', 'mixed', '', '1/2/2/5', 'อุปสรรคมาก ต้องต่อสู้อย่างหนัก', '阻碍多，须奋力拼搏', '阻礙多，須奮力拼搏', 'Many obstacles that demand hard struggle'],
  ['26', 'good', 'money,work', '4/1/1/6', 'หาเงินง่าย มีโอกาสงานต่างประเทศ', '赚钱容易，有海外工作机会', '賺錢容易，有海外工作機會', 'Easy money and chances to work abroad'],
  ['27', 'mixed', '', '1/1/3/5', 'สำเร็จได้แต่มักกดดันตัวเอง', '能成功但常给自己压力', '能成功但常給自己壓力', 'Success that comes with self-imposed pressure'],
  ['28', 'mixed', '', '1/1/2/4', 'ถ้าเป็นระบบจะดี ถ้าไม่รอบคอบจะเสียหาย', '有条理则好，不谨慎则损', '有條理則好，不謹慎則損', 'Good if organised, costly if careless'],
  ['29', 'mixed', '', '0/1/3/4', 'ใจอ่อน มีศัตรูคอยปองร้าย', '心软，有对手暗中算计', '心軟，有對手暗中算計', 'Soft-hearted, with enemies plotting'],
  ['30', 'bad', 'stress', '0/3/2/5', 'วู่วาม ระวังอุบัติเหตุและการเปลี่ยนแปลงกะทันหัน', '冲动，防意外与突变', '衝動，防意外與突變', 'Rash; watch for accidents and sudden change'],
  ['31', 'mixed', '', '0/1/4/5', 'ต้นลำบาก ปลายสำเร็จ', '先难后成', '先難後成', 'Hard at first, successful later'],
  ['32', 'good', 'work,love,money', '3/0/1/4', 'เรียนรู้สิ่งใหม่ การงาน ความรัก และการค้าดี', '学习新事物顺，事业、爱情、生意皆佳', '學習新事物順，事業、愛情、生意皆佳', 'Learning, work, love and trade all go well'],
  ['33', 'bad', 'stress', '0/4/1/5', 'ฉุนเฉียว ร้อนแรง ระวังอุบัติเหตุจากความเร็ว', '急躁暴烈，防超速意外', '急躁暴烈，防超速意外', 'Fiery temper; beware of speed-related accidents'],
  ['34', 'mixed', '', '1/0/3/4', 'ปัญญาไว แต่มีอุปสรรค เพื่อนแท้น้อย', '头脑灵活，但有阻碍，知己少', '頭腦靈活，但有阻礙，知己少', 'Quick mind, but obstacles and few true friends'],
  ['35', 'mixed', '', '1/1/2/4', 'บางตำราว่าอาภัพ บางตำราว่าได้คู่ดีส่งเสริมงาน', '有说命途多舛，也有说得良伴助事业', '有說命途多舛，也有說得良伴助事業', 'Unlucky to some; a supportive partner to others'],
  ['36', 'good', 'love,work', '6/1/0/7', 'ความรักดี ประสบความสำเร็จทั้งงานและความรัก', '爱情顺利，事业爱情双成', '愛情順利，事業愛情雙成', 'Success in both work and love'],
  ['37', 'bad', 'stress,love', '0/4/1/5', 'ขัดแย้ง พลัดพราก ระวังอุบัติเหตุ', '冲突、离别，防意外', '衝突、離別，防意外', 'Conflict, separation and accidents'],
  ['38', 'bad', 'stress', '0/3/1/4', 'หลงอบายมุข การพนัน โกรธง่าย', '易沉迷赌博恶习，易怒', '易沉迷賭博惡習，易怒', 'Drawn to vices and gambling; quick to anger'],
  ['39', 'mixed', '', '0/1/3/4', 'มีเรื่องยุ่งยาก แต่มีมิตรคอยช่วย', '麻烦多，但有朋友相助', '麻煩多，但有朋友相助', 'Complications, but friends help'],
  ['40', 'good', 'wisdom,work', '4/0/0/4', 'ดวงดี ใฝ่รู้ ได้เดินทาง มีชื่อเสียง', '运好，好学，多出行，有名声', '運好，好學，多出行，有名聲', 'Good fortune, curiosity, travel and reputation'],
  ['41', 'good', 'work,money', '5/0/1/6', 'เลขดีมาก ประสบความสำเร็จ การเงินดี มีชื่อเสียง', '极好之数，成功、财运佳、有名声', '極好之數，成功、財運佳、有名聲', 'Excellent: success, money and fame'],
  ['42', 'good', 'love,work', '5/0/0/5', 'มงคลยิ่ง เป็นที่รัก งานและความรักสำเร็จ', '大吉，受人喜爱，事业爱情皆成', '大吉，受人喜愛，事業愛情皆成', 'Very auspicious: loved, with success in work and love'],
  ['43', 'bad', 'stress', '0/3/2/5', 'มีศัตรูกลั่นแกล้ง ผิดหวังบ่อย', '遭人刁难，常失望', '遭人刁難，常失望', 'Harassed by enemies and often disappointed'],
  ['44', 'good', 'money,speech', '4/0/1/5', 'สำเร็จทุกด้าน เหมาะกับการค้าและงานนายหน้า', '各方面成功，宜经商、中介', '各方面成功，宜經商、仲介', 'Success all round; good for trade and brokering'],
  ['45', 'good', 'luck,work,patron', '5/0/0/5', 'ดวงดีมาก ก้าวหน้า มีโชค มีคนช่วย', '运势极佳，进步，有好运和贵人', '運勢極佳，進步，有好運和貴人', 'Very lucky: progress, fortune and helpers'],
  ['46', 'good', 'love', '5/0/0/5', 'มีความสุข ประสบความสำเร็จ แต่ใจอ่อน', '幸福成功，但心软', '幸福成功，但心軟', 'Happy and successful, if soft-hearted'],
  ['47', 'mixed', '', '1/0/3/4', 'ใจอ่อน เชื่อคนง่าย ต้องอาศัยความเพียร', '心软轻信，须靠努力', '心軟輕信，須靠努力', 'Soft and trusting; success needs perseverance'],
  ['48', 'mixed', '', '0/2/2/4', 'ถูกหว่านล้อมหลงผิด มิตรไม่จริงใจ', '易被说服误入歧途，朋友不真心', '易被說服誤入歧途，朋友不真心', 'Easily led astray by insincere friends'],
  ['49', 'mixed', '', '0/1/3/4', 'อับโชค เจอเรื่องไม่คาดคิด', '运气欠佳，常遇意外之事', '運氣欠佳，常遇意外之事', 'Unlucky, with unexpected events'],
  ['50', 'good', 'wisdom,work', '4/0/1/5', 'ปัญญาดี เด่นด้านต่างประเทศและการเดินทาง', '智慧好，利海外与出行', '智慧好，利海外與出行', 'Wise; favors foreign affairs and travel'],
  ['51', 'good', 'luck,work,money', '6/0/0/6', 'สมบูรณ์ดียิ่ง ดาวคู่มิตร สำเร็จทุกด้าน', '圆满极佳，诸事成功', '圓滿極佳，諸事成功', 'Excellent and complete: success in everything'],
  ['52', 'mixed', '', '2/0/2/4', 'มีผู้สนับสนุน แต่บางตำราว่าผู้หญิงมีอุปสรรค', '有人支持，但有说女性多阻碍', '有人支持，但有說女性多阻礙', 'Supported by others, though some say harder for women'],
  ['53', 'mixed', '', '0/1/3/4', 'ดีปนร้าย ระวังการคบคน', '吉凶参半，交友要谨慎', '吉凶參半，交友要謹慎', 'Mixed fortune; choose friends carefully'],
  ['54', 'good', 'work,luck,money', '6/0/0/6', 'มงคลยิ่ง ได้ตำแหน่งสูง มีโชคลาภ เด่นด้านการลงทุน', '大吉，地位高，有偏财，利投资', '大吉，地位高，有偏財，利投資', 'Very auspicious: high position, windfalls, investment'],
  ['55', 'good', 'work,money', '6/0/0/6', 'สมบูรณ์พูนผล งานก้าวหน้า การเงินมั่นคง', '圆满丰收，事业进步，财务稳固', '圓滿豐收，事業進步，財務穩固', 'Abundant: career progress and stable money'],
  ['56', 'good', 'luck,money', '4/1/0/5', 'ดวงดีมาก ประสบความสำเร็จทุกด้าน', '运势极佳，诸事成功', '運勢極佳，諸事成功', 'Very lucky, successful in everything'],
  ['57', 'bad', 'stress', '0/3/2/5', 'ดื้อรั้น ขัดแย้งในใจ ชีวิตไม่แน่นอน', '固执，内心矛盾，人生不稳', '固執，內心矛盾，人生不穩', 'Stubborn and conflicted; an uncertain life'],
  ['58', 'mixed', '', '0/1/2/3', 'หลงผิดง่าย หลงในพิธีกรรมลึกลับ', '易误入歧途，迷信神秘仪式', '易誤入歧途，迷信神秘儀式', 'Easily misled, drawn to mysterious rituals'],
  ['59', 'good', 'luck,work', '5/0/0/5', 'จิตใจดี ลางสังหรณ์แม่น สำเร็จด้านการงาน', '心地善良，直觉准，事业有成', '心地善良，直覺準，事業有成', 'Kind, intuitive and successful at work'],
  ['60', 'mixed', '', '1/0/3/4', 'รักความงาม รักง่ายหน่ายเร็ว', '爱美，感情来得快去得快', '愛美，感情來得快去得快', 'Loves beauty; quick to love, quick to tire'],
  ['61', 'mixed', '', '0/2/2/4', 'ขัดแย้งในใจ หลงในกามารมณ์', '内心矛盾，易沉溺情欲', '內心矛盾，易沉溺情慾', 'Inner conflict and strong temptations'],
  ['62', 'mixed', '', '1/1/1/3', 'หลงผิดง่าย แต่มีคนอุปถัมภ์', '易犯错，但有人扶持', '易犯錯，但有人扶持', 'Easily misled, but has patrons'],
  ['63', 'good', 'work', '3/0/1/4', 'ไม่มีอุปสรรค ประสบความสำเร็จ ก้าวหน้า', '无阻碍，成功进步', '無阻礙，成功進步', 'No obstacles: success and progress'],
  ['64', 'good', 'love,speech', '3/0/0/3', 'มีรสนิยม มีเสน่ห์ ค้าขายและเจรจาดี', '有品味有魅力，善经商谈判', '有品味有魅力，善經商談判', 'Taste and charm; good at trade and negotiation'],
  ['65', 'good', 'patron,work', '6/0/0/6', 'มีผู้ช่วยเหลือ บุญเก่าหนุน งานมั่นคง', '有贵人，宿福护持，工作稳', '有貴人，宿福護持，工作穩', 'Helpers, past merit and a stable career'],
  ['66', 'bad', 'money', '0/3/0/3', 'ลุ่มหลง ฟุ่มเฟือย ถือเป็นเลขอันตราย', '沉迷奢侈，被视为危险之数', '沉迷奢侈，被視為危險之數', 'Infatuation and extravagance; considered dangerous'],
  ['67', 'bad', 'love', '0/3/0/3', 'ผิดหวัง ครอบครัวแตกร้าว', '失望，家庭不和', '失望，家庭不和', 'Disappointment and family rifts'],
  ['68', 'mixed', '', '2/2/0/4', 'ตำราเดิมว่าลุ่มหลงถูกหลอก สื่อด้านเบอร์ว่าเงินและความรักดี', '传统说沉迷受骗，号码类媒体说财运爱情好', '傳統說沉迷受騙，號碼類媒體說財運愛情好', 'Old tables say deception; phone guides say money and love'],
  ['69', 'good', 'work,love', '4/0/2/6', 'การงานและความรักดี แต่ใจอ่อน', '事业爱情佳，但心软', '事業愛情佳，但心軟', 'Good work and love, if soft-hearted'],
  ['70', 'bad', 'stress', '0/3/0/3', 'ร้ายมาก มีกรรมเก่า คดีความ', '大凶，宿业、官司', '大凶，宿業、官司', 'Very unlucky: old karma and lawsuits'],
  ['71', 'bad', 'stress', '0/3/0/3', 'ตกต่ำ ถูกขัดขวางและใส่ร้าย', '运势低落，受阻挠与诬陷', '運勢低落，受阻撓與誣陷', 'Decline, obstruction and slander'],
  ['72', 'mixed', '', '1/1/1/3', 'ดวงแข็ง เจริญรุ่งเรืองแต่วุ่นวาย', '命硬，兴旺但忙乱', '命硬，興旺但忙亂', 'Tough fate: prosperous but hectic'],
  ['73', 'bad', 'health', '0/3/0/3', 'อุบัติเหตุฉับพลัน เจ้ากรรมนายเวร', '突发意外，冤亲债主', '突發意外，冤親債主', 'Sudden accidents and karmic creditors'],
  ['74', 'good', 'patron', '2/0/1/3', 'สำเร็จพอควร ความกตัญญูหนุนชีวิต', '颇有成就，孝道护持人生', '頗有成就，孝道護持人生', 'Fair success, supported by gratitude to parents'],
  ['75', 'mixed', '', '0/0/3/3', 'ต้นร้ายปลายดี', '先苦后甜', '先苦後甜', 'Hard start, good finish'],
  ['76', 'bad', 'love', '0/3/0/3', 'อับเฉา ครอบครัวแตกแยก', '黯淡，家庭破裂', '黯淡，家庭破裂', 'Gloom and a broken family'],
  ['77', 'bad', 'health', '0/3/0/3', 'ทุกข์สองเท่า โรคเรื้อรัง', '双重苦恼，慢性病', '雙重苦惱，慢性病', 'Double trouble and chronic illness'],
  ['78', 'bad', 'stress', '1/2/0/3', 'คดีความ อุบัติเหตุ เรื่องยืดเยื้อ', '官司、意外，事情拖延', '官司、意外，事情拖延', 'Lawsuits, accidents and drawn-out problems'],
  ['79', 'good', 'money,work', '3/0/1/4', 'ฐานะมั่นคง ธุรกิจประสบความสำเร็จ', '家境稳固，生意成功', '家境穩固，生意成功', 'Secure finances and business success'],
  ['80', 'bad', 'stress', '0/3/0/3', 'อัปมงคล ถูกข่มเหงและหาเรื่อง', '不吉，受欺压与刁难', '不吉，受欺壓與刁難', 'Inauspicious: bullied and picked on'],
  ['81', 'bad', 'health,love', '0/3/0/3', 'พลัดพราก สุขภาพไม่แข็งแรง', '离别，身体欠佳', '離別，身體欠佳', 'Separation and poor health'],
];

// ---------------------------------------------------------------------------
// C. 名字总和：1–8、82–100 及名字专用来源说法不同的数字（mahamodo、boonbaramee、Dumex、s-momclub、theluckyname）
// ---------------------------------------------------------------------------
const NAMES: Row[] = [
  ['1', 'good', 'work', '3/0/0/3', 'เป็นผู้นำ มั่นใจ มีชื่อเสียง', '有领导力，自信，有名声', '有領導力，自信，有名聲', 'A confident leader with a good name'],
  ['2', 'mixed', '', '2/0/2/4', 'มองโลกในแง่ดี แต่อ่อนไหวและคิดมาก', '乐观，但敏感多虑', '樂觀，但敏感多慮', 'Optimistic, but sensitive and anxious'],
  ['3', 'mixed', '', '0/0/3/3', 'รักอิสระ ชอบต่อสู้ แต่ขาดการไตร่ตรอง', '爱自由好拼搏，但欠考虑', '愛自由好拼搏，但欠考慮', 'Free-spirited fighter who acts without thinking'],
  ['4', 'good', 'wisdom', '3/0/1/4', 'ฉลาด เอาตัวรอดเก่ง', '聪明，善于自保', '聰明，善於自保', 'Clever and resourceful'],
  ['5', 'good', 'wisdom', '4/0/0/4', 'มีคุณธรรม มีปัญญา น่าเชื่อถือ', '有德有智，值得信赖', '有德有智，值得信賴', 'Virtuous, wise and trustworthy'],
  ['6', 'good', 'love', '4/0/0/4', 'มีเสน่ห์ รักศิลปะ ชีวิตสุขสบาย', '有魅力，爱艺术，生活安逸', '有魅力，愛藝術，生活安逸', 'Charming and artistic; a comfortable life'],
  ['7', 'mixed', '', '0/1/2/3', 'ดื้อ มีความคิดเป็นของตัวเอง มักมีเรื่องทุกข์ใจ', '固执有主见，常有烦恼', '固執有主見，常有煩惱', 'Stubborn and independent, often troubled'],
  ['8', 'bad', 'stress', '0/2/1/3', 'ลุ่มหลงมัวเมา ถูกใส่ร้าย', '沉迷，易遭诬陷', '沉迷，易遭誣陷', 'Infatuation and slander'],
  ['9', 'good', 'luck', '3/1/0/4', 'เลขมงคล มีญาณสังหรณ์', '吉祥之数，直觉灵敏', '吉祥之數，直覺靈敏', 'Auspicious, with keen intuition'],
  ['10', 'bad', 'stress', '0/2/1/3', 'มีอุปสรรค ชีวิตลำบาก', '多阻碍，生活艰辛', '多阻礙，生活艱辛', 'Obstacles and a hard life'],
  ['16', 'bad', 'stress', '0/2/1/3', 'มีความทุกข์และอุปสรรค', '多苦恼阻碍', '多苦惱阻礙', 'Suffering and obstacles'],
  ['22', 'mixed', '', '0/1/1/2', 'เพ้อฝัน หูเบา', '爱幻想，耳根软', '愛幻想，耳根軟', 'Dreamy and easily swayed'],
  ['25', 'bad', 'stress', '0/2/1/3', 'มีอุปสรรคมาก', '阻碍很多', '阻礙很多', 'Many obstacles'],
  ['29', 'bad', 'stress', '0/2/1/3', 'ชีวิตหักกลางคัน', '人生中途受挫', '人生中途受挫', 'Life broken off midway'],
  ['35', 'mixed', '', '0/1/1/2', 'มีอำนาจบารมี แต่บางตำราว่าอาภัพ', '有威望，但有说命途多舛', '有威望，但有說命途多舛', 'Authority, though some say misfortune'],
  ['53', 'mixed', '', '1/0/2/3', 'ดีปนร้าย', '吉凶参半', '吉凶參半', 'Mixed fortune'],
  ['62', 'mixed', '', '1/1/0/2', 'หลงผิดง่าย แต่มีคนอุปถัมภ์', '易犯错，但有人扶持', '易犯錯，但有人扶持', 'Easily misled, but has patrons'],
  ['78', 'mixed', '', '1/1/0/2', 'บางตำราว่ามีคดีความ บางตำราว่ามีบารมีและโชคลาภ', '有说官司，也有说威望与偏财', '有說官司，也有說威望與偏財', 'Lawsuits to some; prestige and luck to others'],
  ['82', 'mixed', '', '1/1/0/2', 'ว้าเหว่ อาภัพคู่ หรือเมตตามหานิยม แล้วแต่ตำรา', '孤独、姻缘薄，或人缘好，说法不一', '孤獨、姻緣薄，或人緣好，說法不一', 'Lonely in love, or well liked, depending on the source'],
  ['83', 'bad', 'stress', '0/1/0/1', 'แตกหัก มีคนไม่ดีคุกคาม', '决裂，受小人威胁', '決裂，受小人威脅', 'Breakups and threats from bad people'],
  ['84', 'bad', 'stress', '0/1/0/1', 'โชคร้าย อุบัติเหตุ คดีความ', '运差，意外，官司', '運差，意外，官司', 'Bad luck, accidents and lawsuits'],
  ['85', 'bad', 'stress', '0/1/0/1', 'หลงผิดง่าย ขาดที่พึ่ง', '易误入歧途，缺乏依靠', '易誤入歧途，缺乏依靠', 'Easily misled and without support'],
  ['86', 'mixed', '', '0/0/1/1', 'สำเร็จทางโลก แต่แพ้กิเลส', '世俗有成，但难敌欲望', '世俗有成，但難敵慾望', 'Worldly success but weak against desire'],
  ['87', 'mixed', '', '1/1/0/2', 'อ่อนไหวหลงผิดง่าย หรือมีบารมี แล้วแต่ตำรา', '敏感易错，或有威望，说法不一', '敏感易錯，或有威望，說法不一', 'Sensitive and misled, or prestigious, by source'],
  ['88', 'mixed', '', '0/0/1/1', 'สำเร็จเร็ว แต่ระวังอุบัติเหตุ', '成功快，但防意外', '成功快，但防意外', 'Quick success; watch for accidents'],
  ['89', 'good', 'wisdom,work', '2/0/0/2', 'หัวไว เข้าสังคมเก่ง มีบารมี', '头脑灵活，善交际，有威望', '頭腦靈活，善交際，有威望', 'Quick-minded, sociable and respected'],
  ['90', 'mixed', '', '1/0/1/2', 'สิ่งศักดิ์สิทธิ์คุ้มครอง ปลอดภัย', '有神明护佑，平安', '有神明護佑，平安', 'Protected and safe'],
  ['91', 'mixed', '', '0/0/1/1', 'ก้าวหน้า แต่เสียสุขภาพ', '进步，但损健康', '進步，但損健康', 'Progress at the cost of health'],
  ['92', 'good', 'love,work', '2/0/0/2', 'อ่อนโยน มีเพื่อนมาก มีอำนาจวาสนา', '温和，朋友多，有权势福分', '溫和，朋友多，有權勢福分', 'Gentle, with many friends and good fortune'],
  ['93', 'bad', 'stress', '0/1/0/1', 'แข็งกร้าว ระวังอุบัติเหตุ', '刚硬，防意外', '剛硬，防意外', 'Harsh; watch for accidents'],
  ['94', 'bad', 'stress', '0/1/0/1', 'สำเร็จได้แต่อุปสรรคมาก', '能成功但阻碍多', '能成功但阻礙多', 'Success with many obstacles'],
  ['95', 'good', 'luck,patron', '2/0/0/2', 'มงคลมาก มีผู้คุ้มครอง มีเกียรติ', '大吉，有护佑，有荣誉', '大吉，有護佑，有榮譽', 'Very auspicious: protection and honor'],
  ['96', 'mixed', '', '1/0/1/2', 'ใจอ่อน คบคนดีก็ดี คบคนไม่ดีก็เสีย', '心软，近朱者赤近墨者黑', '心軟，近朱者赤近墨者黑', 'Soft: good company helps, bad company harms'],
  ['97', 'good', 'money', '1/0/0/1', 'รุ่งเรือง การค้าได้กำไร', '兴旺，生意获利', '興旺，生意獲利', 'Prosperity and profitable trade'],
  ['98', 'good', 'work', '1/0/0/1', 'ประสบความสำเร็จ มีพวกพ้องมาก', '成功，同伴多', '成功，同伴多', 'Success with many allies'],
  ['99', 'good', 'luck', '2/0/0/2', 'มีญาณหยั่งรู้ พระคุ้มครอง', '有洞察力，佛佑', '有洞察力，佛佑', 'Insight and divine protection'],
  ['100', 'good', 'luck', '4/0/0/4', 'มงคลมาก สมบูรณ์ทุกอย่าง', '大吉，圆满', '大吉，圓滿', 'Very auspicious: complete in everything'],
];

export const PAIR_MEANINGS: Record<string, NumberMeaning> = build(PAIRS);
export const SUM_MEANINGS: Record<string, NumberMeaning> = build(SUMS);
export const NAME_MEANINGS: Record<string, NumberMeaning> = build(NAMES);

/** 与 @lucky/core 的 PhoneRuleSet 结构一致，可直接传给 analyzeThaiMobile */
export const THAI_PHONE_RULES = {
  id: 'thai-common-2026-10',
  pairs: Object.fromEntries(Object.entries(PAIR_MEANINGS).map(([k, v]) => [k, { tone: v.tone, topics: v.topics, meaning: v.meaning }])),
  sums: Object.fromEntries(Object.entries(SUM_MEANINGS).map(([k, v]) => [k, { tone: v.tone, topics: v.topics, meaning: v.meaning }])),
};

/**
 * 名字、车牌总和超过 100 时的通行读法（theluckyname、Dumex、MamaExpert）：
 * 101–109 去掉中间的 0（109 读作 19）；110 以上取最后两位。
 */
export function readableTotal(total: number): number {
  if (total <= 100) return total;
  if (total <= 109) return Number(`${Math.floor(total / 100)}${total % 10}`);
  return total % 100 || 100;
}

/** 名字或车牌总和的含义：名字专用说法优先，其次用通用的 1–100 表 */
export function totalMeaning(total: number): { read: number; meaning: NumberMeaning | null } {
  const read = readableTotal(total);
  return { read, meaning: NAME_MEANINGS[String(read)] ?? SUM_MEANINGS[String(read)] ?? null };
}
