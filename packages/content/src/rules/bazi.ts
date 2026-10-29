/**
 * 八字基础解读规则库：把计算核心输出的结论编号翻译成四种语言的文字。
 * 文案为初稿，上线前由命理顾问审校；泰文另需母语编辑审校。
 */
import type { Locale } from '../locales.ts';

type El = 0 | 1 | 2 | 3 | 4;
type Group = 'peer' | 'output' | 'wealth' | 'authority' | 'resource';

/** 与 @lucky/core 的 BaziConclusion 结构一致（此处不依赖 core，避免循环依赖） */
export type ConclusionLike =
  | { code: 'strength'; level: 'strong' | 'balanced' | 'weak'; ratio: number }
  | { code: 'favorable'; elements: El[] }
  | { code: 'dominant-group'; group: Group }
  | { code: 'missing-element'; element: El }
  | { code: 'day-master'; element: El; yang: boolean };

interface RuleText {
  elements: [string, string, string, string, string];
  elementColors: [string, string, string, string, string];
  listSep: string;
  yang: string;
  yin: string;
  dayMaster: [string, string, string, string, string];
  dayMasterPrefix: string;
  strength: Record<'strong' | 'balanced' | 'weak', string>;
  favorable: string;
  dominant: Record<Group, string>;
  missing: string;
}

const zhHans: RuleText = {
  elements: ['木', '火', '土', '金', '水'],
  elementColors: ['绿色', '红色、紫色', '黄色、棕色', '白色、金色', '黑色、蓝色'],
  listSep: '、',
  yang: '阳',
  yin: '阴',
  dayMasterPrefix: '日主为{polarity}{element}。',
  dayMaster: [
    '像树木一样向上生长，重视成长与规划，待人宽厚。',
    '热情外向，行动力强，善于表达和感染他人。',
    '稳重踏实，讲信用，是团队里可靠的支撑。',
    '果断有原则，做事讲效率，重视规则与公平。',
    '聪明灵活，适应力强，善于观察和沟通。',
  ],
  strength: {
    strong: '日主偏强（帮身占比 {pct}%）。精力和主见较足，适合主动开拓，但要留意固执和独断。',
    balanced: '日主中和（帮身占比 {pct}%）。五行相对平衡，适应面广，关键在于把握时机。',
    weak: '日主偏弱（帮身占比 {pct}%）。更需要贵人、学习和团队支持，借力发展比单打独斗更顺。',
  },
  favorable: '喜用五行：{elements}。日常可在颜色、方位、行业选择上适当偏向这些五行，对应颜色为{colors}。',
  dominant: {
    peer: '命局比劫最旺：重视朋友和同伴，独立性强，合作时要注意分工和利益分配。',
    output: '命局食伤最旺：才华外露，善于表达和创作，适合需要创意或技术的工作。',
    wealth: '命局财星最旺：务实，重视结果和资源，理财与经营意识较强。',
    authority: '命局官杀最旺：责任感强，重视规则和地位，适合在组织中承担管理职责。',
    resource: '命局印星最旺：重视学习和思考，容易得到长辈或贵人的照顾。',
  },
  missing: '八字中没有{element}（按天干和地支本气统计）。缺某一五行不等于不好，需要结合强弱和喜用整体来看。',
};

const zhHant: RuleText = {
  elements: ['木', '火', '土', '金', '水'],
  elementColors: ['綠色', '紅色、紫色', '黃色、棕色', '白色、金色', '黑色、藍色'],
  listSep: '、',
  yang: '陽',
  yin: '陰',
  dayMasterPrefix: '日主為{polarity}{element}。',
  dayMaster: [
    '像樹木一樣向上生長，重視成長與規劃，待人寬厚。',
    '熱情外向，行動力強，善於表達和感染他人。',
    '穩重踏實，講信用，是團隊裡可靠的支撐。',
    '果斷有原則，做事講效率，重視規則與公平。',
    '聰明靈活，適應力強，善於觀察和溝通。',
  ],
  strength: {
    strong: '日主偏強（幫身佔比 {pct}%）。精力和主見較足，適合主動開拓，但要留意固執和獨斷。',
    balanced: '日主中和（幫身佔比 {pct}%）。五行相對平衡，適應面廣，關鍵在於把握時機。',
    weak: '日主偏弱（幫身佔比 {pct}%）。更需要貴人、學習和團隊支持，借力發展比單打獨鬥更順。',
  },
  favorable: '喜用五行：{elements}。日常可在顏色、方位、行業選擇上適當偏向這些五行，對應顏色為{colors}。',
  dominant: {
    peer: '命局比劫最旺：重視朋友和同伴，獨立性強，合作時要注意分工和利益分配。',
    output: '命局食傷最旺：才華外露，善於表達和創作，適合需要創意或技術的工作。',
    wealth: '命局財星最旺：務實，重視結果和資源，理財與經營意識較強。',
    authority: '命局官殺最旺：責任感強，重視規則和地位，適合在組織中承擔管理職責。',
    resource: '命局印星最旺：重視學習和思考，容易得到長輩或貴人的照顧。',
  },
  missing: '八字中沒有{element}（按天干和地支本氣統計）。缺某一五行不等於不好，需要結合強弱和喜用整體來看。',
};

const th: RuleText = {
  elements: ['ไม้', 'ไฟ', 'ดิน', 'ทอง', 'น้ำ'],
  elementColors: ['สีเขียว', 'สีแดง สีม่วง', 'สีเหลือง สีน้ำตาล', 'สีขาว สีทอง', 'สีดำ สีน้ำเงิน'],
  listSep: ', ',
  yang: 'หยาง',
  yin: 'หยิน',
  dayMasterPrefix: 'ธาตุประจำตัวของคุณคือธาตุ{element} ({polarity}) ',
  dayMaster: [
    'เติบโตขึ้นเหมือนต้นไม้ ให้ความสำคัญกับการพัฒนาตนเองและการวางแผน มีน้ำใจต่อผู้อื่น',
    'กระตือรือร้น เปิดเผย ลงมือทำได้รวดเร็ว และสื่อสารได้ดี',
    'มั่นคง หนักแน่น รักษาคำพูด เป็นที่พึ่งพาของทีม',
    'เด็ดขาด มีหลักการ ทำงานมีประสิทธิภาพ ให้ความสำคัญกับความยุติธรรม',
    'ฉลาด ยืดหยุ่น ปรับตัวเก่ง ช่างสังเกตและสื่อสารได้ดี',
  ],
  strength: {
    strong: 'ธาตุประจำตัวค่อนข้างแข็ง (สัดส่วนธาตุที่ส่งเสริม {pct}%) มีพลังและความมั่นใจสูง เหมาะกับการบุกเบิก แต่ควรระวังความดื้อรั้น',
    balanced: 'ธาตุประจำตัวสมดุล (สัดส่วนธาตุที่ส่งเสริม {pct}%) ปรับตัวได้กับหลายสถานการณ์ สิ่งสำคัญคือการจับจังหวะให้ถูก',
    weak: 'ธาตุประจำตัวค่อนข้างอ่อน (สัดส่วนธาตุที่ส่งเสริม {pct}%) จะไปได้ดีเมื่อมีผู้อุปถัมภ์ การเรียนรู้ และทีมที่ดีคอยสนับสนุน',
  },
  favorable: 'ธาตุที่ส่งผลดีต่อคุณ: {elements} ในชีวิตประจำวันสามารถเลือกสี ทิศทาง และอาชีพที่สอดคล้องกับธาตุเหล่านี้ สีที่เหมาะคือ {colors}',
  dominant: {
    peer: 'ดวงมีพลังของเพื่อนพ้องเด่น ให้ความสำคัญกับเพื่อนและหุ้นส่วน เป็นตัวของตัวเองสูง เวลาร่วมงานควรแบ่งงานและผลประโยชน์ให้ชัดเจน',
    output: 'ดวงมีพลังความคิดสร้างสรรค์เด่น มีพรสวรรค์ สื่อสารและสร้างสรรค์งานได้ดี เหมาะกับงานที่ใช้ไอเดียหรือทักษะเฉพาะทาง',
    wealth: 'ดวงมีพลังด้านทรัพย์เด่น เป็นคนเน้นผลลัพธ์ เข้าใจการบริหารเงินและธุรกิจ',
    authority: 'ดวงมีพลังด้านอำนาจเด่น มีความรับผิดชอบสูง เคารพกฎเกณฑ์ เหมาะกับบทบาทผู้บริหารในองค์กร',
    resource: 'ดวงมีพลังด้านผู้อุปถัมภ์เด่น รักการเรียนรู้และการคิดไตร่ตรอง มักได้รับการดูแลจากผู้ใหญ่',
  },
  missing: 'ในดวงไม่มีธาตุ{element} (นับจากก้านฟ้าและธาตุหลักของกิ่งดิน) การขาดธาตุใดธาตุหนึ่งไม่ได้แปลว่าไม่ดี ต้องดูภาพรวมร่วมกับความแข็งอ่อนของดวง',
};

const en: RuleText = {
  elements: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'],
  elementColors: ['green', 'red and purple', 'yellow and brown', 'white and gold', 'black and blue'],
  listSep: ', ',
  yang: 'Yang',
  yin: 'Yin',
  dayMasterPrefix: 'Your Day Master is {polarity} {element}. ',
  dayMaster: [
    'Like a growing tree, you value growth and planning and are generous with others.',
    'Warm and outgoing, you act quickly and express yourself well.',
    'Steady and dependable, you keep your word and anchor the people around you.',
    'Decisive and principled, you value efficiency, rules and fairness.',
    'Clever and adaptable, you observe closely and communicate well.',
  ],
  strength: {
    strong: 'Your Day Master is strong ({pct}% supporting elements). You have energy and conviction for new ventures; watch out for stubbornness.',
    balanced: 'Your Day Master is balanced ({pct}% supporting elements). You adapt to many situations; timing is what matters most.',
    weak: 'Your Day Master is weak ({pct}% supporting elements). Mentors, learning and a good team help you more than going it alone.',
  },
  favorable: 'Favorable elements: {elements}. Lean toward them in colors, directions and career choices; the matching colors are {colors}.',
  dominant: {
    peer: 'Peers dominate your chart: friends and partners matter to you and you are independent; agree clearly on roles and rewards when working together.',
    output: 'Output dominates your chart: talented and expressive, you suit creative or skilled work.',
    wealth: 'Wealth dominates your chart: practical and results-focused, with a good sense for money and business.',
    authority: 'Authority dominates your chart: responsible and rule-minded, you suit management roles in an organization.',
    resource: 'Resource dominates your chart: you love learning and reflection and tend to receive support from mentors.',
  },
  missing: 'Your chart has no {element} (counting stems and main branch elements). A missing element is not bad in itself; read it together with strength and favorable elements.',
};

const TEXTS: Record<Locale, RuleText> = { 'zh-hans': zhHans, 'zh-hant': zhHant, th, en };

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '');
}

/** 把结论列表渲染成段落（顺序：日主、强弱、喜用、主导十神、缺失五行） */
export function renderBaziReading(conclusions: ConclusionLike[], locale: Locale): string[] {
  const t = TEXTS[locale];
  const order = ['day-master', 'strength', 'favorable', 'dominant-group', 'missing-element'];
  return [...conclusions]
    .sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code))
    .map((c) => {
      switch (c.code) {
        case 'day-master':
          return fill(t.dayMasterPrefix, { polarity: c.yang ? t.yang : t.yin, element: t.elements[c.element] }) + t.dayMaster[c.element];
        case 'strength':
          return fill(t.strength[c.level], { pct: String(Math.round(c.ratio * 100)) });
        case 'favorable':
          return fill(t.favorable, {
            elements: c.elements.map((e) => t.elements[e]).join(t.listSep),
            colors: c.elements.map((e) => t.elementColors[e]).join(t.listSep),
          });
        case 'dominant-group':
          return t.dominant[c.group];
        case 'missing-element':
          return fill(t.missing, { element: t.elements[c.element] });
      }
    });
}
