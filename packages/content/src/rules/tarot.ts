/**
 * 塔罗 22 张大阿尔卡那：牌名与正逆位的通用关键词（关键词为通行的公共含义）。
 * 泰文为初稿，上线前由母语编辑审校。
 */
import type { Locale } from '../locales.ts';

export interface TarotCard {
  n: number;
  name: Record<Locale, string>;
  upright: Record<Locale, string>;
  reversed: Record<Locale, string>;
}

type T = [string, string, string, string]; // zh-hans, zh-hant, th, en
const c = (n: number, name: T, up: T, rev: T): TarotCard => {
  const r = (x: T) => ({ 'zh-hans': x[0], 'zh-hant': x[1], th: x[2], en: x[3] });
  return { n, name: r(name), upright: r(up), reversed: r(rev) };
};

export const TAROT_MAJOR: readonly TarotCard[] = [
  c(0, ['愚人', '愚人', 'The Fool (คนโง่)', 'The Fool'],
    ['新的开始、冒险、自由，勇敢迈出第一步。', '新的開始、冒險、自由，勇敢邁出第一步。', 'การเริ่มต้นใหม่ การผจญภัย อิสระ กล้าก้าวแรก', 'New beginnings, adventure and freedom: take the first step.'],
    ['冲动、草率、准备不足，先想清楚再出发。', '衝動、草率、準備不足，先想清楚再出發。', 'ใจร้อน ประมาท ขาดการเตรียมตัว คิดให้รอบคอบก่อน', 'Recklessness and poor preparation: think before you leap.']),
  c(1, ['魔术师', '魔術師', 'The Magician (นักมายากล)', 'The Magician'],
    ['能力、创造、行动力，资源已经齐备。', '能力、創造、行動力，資源已經齊備。', 'ความสามารถ ความคิดสร้างสรรค์ มีทรัพยากรพร้อม', 'Skill, creativity and action: you have what you need.'],
    ['才能被浪费、欺骗、计划落空。', '才能被浪費、欺騙、計劃落空。', 'ใช้ความสามารถผิดทาง การหลอกลวง แผนไม่เป็นผล', 'Wasted talent, trickery or plans that fall flat.']),
  c(2, ['女祭司', '女祭司', 'The High Priestess (นักบวชหญิง)', 'The High Priestess'],
    ['直觉、智慧、静观其变，答案在内心。', '直覺、智慧、靜觀其變，答案在內心。', 'สัญชาตญาณ ปัญญา รอดูสถานการณ์ คำตอบอยู่ในใจ', 'Intuition and inner wisdom: wait and listen to yourself.'],
    ['忽视直觉、秘密被揭开、心绪不宁。', '忽視直覺、秘密被揭開、心緒不寧。', 'มองข้ามสัญชาตญาณ ความลับถูกเปิดเผย จิตใจว้าวุ่น', 'Ignored intuition, secrets revealed, a restless mind.']),
  c(3, ['女皇', '女皇', 'The Empress (จักรพรรดินี)', 'The Empress'],
    ['丰盛、滋养、爱与美，收获的季节。', '豐盛、滋養、愛與美，收穫的季節。', 'ความอุดมสมบูรณ์ ความรัก ความงาม ฤดูแห่งการเก็บเกี่ยว', 'Abundance, nurture, love and beauty: a season of harvest.'],
    ['过度依赖、停滞、忽略自己。', '過度依賴、停滯、忽略自己。', 'พึ่งพาผู้อื่นมากเกินไป หยุดนิ่ง ละเลยตัวเอง', 'Dependence, stagnation or neglecting yourself.']),
  c(4, ['皇帝', '皇帝', 'The Emperor (จักรพรรดิ)', 'The Emperor'],
    ['秩序、权威、稳定，按计划执行。', '秩序、權威、穩定，按計劃執行。', 'ระเบียบ อำนาจ ความมั่นคง ทำตามแผน', 'Order, authority and stability: follow the plan.'],
    ['专横、僵化、失去控制。', '專橫、僵化、失去控制。', 'เผด็จการ ไม่ยืดหยุ่น ควบคุมไม่ได้', 'Domineering, rigid or out of control.']),
  c(5, ['教皇', '教皇', 'The Hierophant (พระสังฆราช)', 'The Hierophant'],
    ['传统、导师、学习，听取有经验者的意见。', '傳統、導師、學習，聽取有經驗者的意見。', 'ประเพณี ครูบาอาจารย์ การเรียนรู้ ฟังคำแนะนำผู้มีประสบการณ์', 'Tradition, mentors and learning: seek experienced advice.'],
    ['打破常规、不信任权威、走自己的路。', '打破常規、不信任權威、走自己的路。', 'แหกกฎเกณฑ์ ไม่เชื่อผู้มีอำนาจ เดินทางของตัวเอง', 'Breaking convention and going your own way.']),
  c(6, ['恋人', '戀人', 'The Lovers (คู่รัก)', 'The Lovers'],
    ['爱情、和谐、重要的选择。', '愛情、和諧、重要的選擇。', 'ความรัก ความกลมเกลียว การตัดสินใจครั้งสำคัญ', 'Love, harmony and an important choice.'],
    ['关系失衡、选择困难、价值观冲突。', '關係失衡、選擇困難、價值觀衝突。', 'ความสัมพันธ์ไม่สมดุล ตัดสินใจไม่ได้ ค่านิยมขัดแย้ง', 'Imbalance, indecision or clashing values.']),
  c(7, ['战车', '戰車', 'The Chariot (รถศึก)', 'The Chariot'],
    ['意志、胜利、前进，专注就能成功。', '意志、勝利、前進，專注就能成功。', 'ความมุ่งมั่น ชัยชนะ ก้าวหน้า ตั้งใจแล้วจะสำเร็จ', 'Willpower and victory: focus and you will win.'],
    ['方向不明、失控、受阻。', '方向不明、失控、受阻。', 'ไร้ทิศทาง ควบคุมไม่ได้ ถูกขัดขวาง', 'No direction, loss of control or obstacles.']),
  c(8, ['力量', '力量', 'Strength (พลัง)', 'Strength'],
    ['勇气、耐心、以柔克刚。', '勇氣、耐心、以柔克剛。', 'ความกล้าหาญ ความอดทน ความอ่อนโยนชนะความแข็งกร้าว', 'Courage, patience and gentle strength.'],
    ['自我怀疑、软弱、情绪失控。', '自我懷疑、軟弱、情緒失控。', 'ไม่มั่นใจในตัวเอง อ่อนแอ ควบคุมอารมณ์ไม่ได้', 'Self-doubt, weakness or emotions running wild.']),
  c(9, ['隐士', '隱士', 'The Hermit (ฤๅษี)', 'The Hermit'],
    ['内省、独处、寻找答案。', '內省、獨處、尋找答案。', 'การทบทวนตนเอง ความสันโดษ การแสวงหาคำตอบ', 'Reflection and solitude: searching for answers.'],
    ['孤立、逃避、过度封闭。', '孤立、逃避、過度封閉。', 'โดดเดี่ยว หนีปัญหา ปิดกั้นตัวเองมากเกินไป', 'Isolation, avoidance or shutting yourself away.']),
  c(10, ['命运之轮', '命運之輪', 'Wheel of Fortune (กงล้อแห่งโชคชะตา)', 'Wheel of Fortune'],
    ['转机、好运、命运的转折。', '轉機、好運、命運的轉折。', 'จุดเปลี่ยน โชคดี ชะตาชีวิตพลิกผัน', 'A turning point and good luck.'],
    ['运气不佳、抗拒变化、周期低谷。', '運氣不佳、抗拒變化、週期低谷。', 'โชคไม่ดี ต่อต้านการเปลี่ยนแปลง ช่วงขาลง', 'Bad luck, resisting change or a low point in the cycle.']),
  c(11, ['正义', '正義', 'Justice (ความยุติธรรม)', 'Justice'],
    ['公平、真相、因果，理性判断。', '公平、真相、因果，理性判斷。', 'ความยุติธรรม ความจริง เหตุและผล ใช้เหตุผลตัดสิน', 'Fairness, truth and cause and effect: judge with reason.'],
    ['不公、逃避责任、偏见。', '不公、逃避責任、偏見。', 'ความไม่เป็นธรรม เลี่ยงความรับผิดชอบ อคติ', 'Unfairness, dodging responsibility or bias.']),
  c(12, ['倒吊人', '倒吊人', 'The Hanged Man (คนแขวนกลับหัว)', 'The Hanged Man'],
    ['暂停、换个角度、为长远牺牲。', '暫停、換個角度、為長遠犧牲。', 'หยุดพัก มองมุมใหม่ เสียสละเพื่อสิ่งที่ยิ่งใหญ่กว่า', 'Pause, a new perspective and sacrifice for the long term.'],
    ['拖延、无谓的牺牲、停滞不前。', '拖延、無謂的犧牲、停滯不前。', 'ผัดวันประกันพรุ่ง เสียสละโดยไร้ค่า ย่ำอยู่กับที่', 'Delay, pointless sacrifice or being stuck.']),
  c(13, ['死神', '死神', 'Death (ความตาย)', 'Death'],
    ['结束与重生、告别旧事物、转变（并非字面上的死亡）。', '結束與重生、告別舊事物、轉變（並非字面上的死亡）。', 'การสิ้นสุดและเริ่มต้นใหม่ ปล่อยวางสิ่งเก่า การเปลี่ยนแปลง (ไม่ได้หมายถึงความตายจริง)', 'Endings, renewal and transformation (not literal death).'],
    ['抗拒改变、拖着不放手。', '抗拒改變、拖著不放手。', 'ต่อต้านการเปลี่ยนแปลง ยึดติดไม่ยอมปล่อย', 'Resisting change and holding on too long.']),
  c(14, ['节制', '節制', 'Temperance (ความพอดี)', 'Temperance'],
    ['平衡、调和、适度。', '平衡、調和、適度。', 'ความสมดุล การผสานกลมกลืน ความพอดี', 'Balance, harmony and moderation.'],
    ['失衡、过度、急躁。', '失衡、過度、急躁。', 'ขาดสมดุล มากเกินไป ใจร้อน', 'Imbalance, excess or impatience.']),
  c(15, ['恶魔', '惡魔', 'The Devil (ปีศาจ)', 'The Devil'],
    ['欲望、束缚、诱惑，看清是什么牵绊着你。', '慾望、束縛、誘惑，看清是什麼牽絆著你。', 'กิเลส พันธนาการ สิ่งยั่วยุ ดูให้ชัดว่าอะไรผูกมัดคุณอยู่', 'Desire, bondage and temptation: see what holds you.'],
    ['挣脱束缚、戒除坏习惯。', '掙脫束縛、戒除壞習慣。', 'หลุดพ้นพันธนาการ เลิกนิสัยไม่ดี', 'Breaking free and dropping bad habits.']),
  c(16, ['高塔', '高塔', 'The Tower (หอคอย)', 'The Tower'],
    ['突变、动荡、旧结构被打破。', '突變、動盪、舊結構被打破。', 'การเปลี่ยนแปลงฉับพลัน ความวุ่นวาย โครงสร้างเดิมพังทลาย', 'Sudden change and upheaval: old structures fall.'],
    ['避免了灾难、拖延不可避免的改变。', '避免了災難、拖延不可避免的改變。', 'รอดพ้นภัย หรือยื้อการเปลี่ยนแปลงที่หนีไม่พ้น', 'Disaster averted, or delaying an inevitable change.']),
  c(17, ['星星', '星星', 'The Star (ดวงดาว)', 'The Star'],
    ['希望、疗愈、灵感，前景光明。', '希望、療癒、靈感，前景光明。', 'ความหวัง การเยียวยา แรงบันดาลใจ อนาคตสดใส', 'Hope, healing and inspiration: a bright outlook.'],
    ['失去信心、灰心、迷茫。', '失去信心、灰心、迷茫。', 'หมดความเชื่อมั่น ท้อแท้ สับสน', 'Lost faith, discouragement or confusion.']),
  c(18, ['月亮', '月亮', 'The Moon (ดวงจันทร์)', 'The Moon'],
    ['不安、幻象、潜意识，事情没有表面那么简单。', '不安、幻象、潛意識，事情沒有表面那麼簡單。', 'ความกังวล ภาพลวงตา จิตใต้สำนึก เรื่องอาจไม่ง่ายอย่างที่เห็น', 'Anxiety, illusion and the subconscious: things are not as they seem.'],
    ['迷雾散去、真相浮现。', '迷霧散去、真相浮現。', 'หมอกจางลง ความจริงปรากฏ', 'The fog lifts and the truth comes out.']),
  c(19, ['太阳', '太陽', 'The Sun (ดวงอาทิตย์)', 'The Sun'],
    ['成功、快乐、活力，一切明朗。', '成功、快樂、活力，一切明朗。', 'ความสำเร็จ ความสุข พลังชีวิต ทุกอย่างสดใส', 'Success, joy and vitality: everything is clear.'],
    ['短暂的低落、过度乐观。', '短暫的低落、過度樂觀。', 'หม่นหมองชั่วคราว มองโลกในแง่ดีเกินไป', 'A brief low, or too much optimism.']),
  c(20, ['审判', '審判', 'Judgement (การพิพากษา)', 'Judgement'],
    ['觉醒、反省、重新出发。', '覺醒、反省、重新出發。', 'การตื่นรู้ การทบทวน การเริ่มต้นใหม่', 'Awakening, reflection and a fresh start.'],
    ['自我怀疑、拒绝反省、错失机会。', '自我懷疑、拒絕反省、錯失機會。', 'ไม่มั่นใจตัวเอง ไม่ยอมทบทวน พลาดโอกาส', 'Self-doubt, refusing to reflect or missed chances.']),
  c(21, ['世界', '世界', 'The World (โลก)', 'The World'],
    ['圆满、完成、达成目标。', '圓滿、完成、達成目標。', 'ความสมบูรณ์ ความสำเร็จ บรรลุเป้าหมาย', 'Completion, fulfilment and reaching your goal.'],
    ['未竟之事、差最后一步。', '未竟之事、差最後一步。', 'เรื่องที่ยังไม่จบ ขาดอีกเพียงก้าวเดียว', 'Unfinished business: one step short.']),
];
