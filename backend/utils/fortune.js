const SIGNS = [
  { sign: '上上签', text: '今朝出门必捡漏，奉贤好价跟你跑' },
  { sign: '上签', text: '嘎算一按，钱包笑开颜' },
  { sign: '中签', text: '慢慢逛，好价在路上' },
  { sign: '小吉', text: '省一点是一点，积少成多' },
  { sign: '吉', text: '海湾的风，吹来实惠' },
];

/** 空瓶幽默文案（约 10% 概率） */
export const EMPTY_BOTTLE_LINES = [
  '今朝运道一般，但省下来的铜钿还在口袋里！',
  '捞到一只空瓶——说明侬已经够省了，再省要变成葛朗台啦',
  '瓶子里只有海风，好在奉贤海风不要钱',
  '空瓶也是瓶，寓意：留白给下一顿好价',
  '阿拉讲：空瓶不空手，心里装着介嘎算就行',
];

export function pickEmptyBottleLine() {
  return EMPTY_BOTTLE_LINES[Math.floor(Math.random() * EMPTY_BOTTLE_LINES.length)];
}

export function generateFortune() {
  const pick = SIGNS[Math.floor(Math.random() * SIGNS.length)];
  return { ...pick, drawnAt: new Date().toISOString() };
}
