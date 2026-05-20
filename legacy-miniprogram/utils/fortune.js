/** 签文与空瓶文案 */
const SIGNS = [
  { sign: '上上签', text: '今朝出门必捡漏，奉贤好价跟你跑' },
  { sign: '上签', text: '嘎算一按，钱包笑开颜' },
  { sign: '中签', text: '慢慢逛，好价在路上' },
];

const EMPTY_LINES = [
  '今朝运道一般，但省下来的铜钿还在口袋里！',
  '捞到一只空瓶——留白给下一顿好价',
  '瓶子里只有海风，好在奉贤海风不要钱',
];

function randomSign() {
  return SIGNS[Math.floor(Math.random() * SIGNS.length)];
}

function randomEmpty() {
  return EMPTY_LINES[Math.floor(Math.random() * EMPTY_LINES.length)];
}

module.exports = { randomSign, randomEmpty };
