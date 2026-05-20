import * as dianping from './dianping_dining.js';
import * as meituan from './meituan_coffee.js';
import * as eleme from './eleme_takeout.js';
import * as ctrip from './ctrip_stay.js';
import * as tujia from './tujia_stay.js';
import * as lvmama from './lvmama_travel.js';
import * as hema from './hema_grocery.js';
import * as missfresh from './missfresh_grocery.js';
import * as xhs from './xiaohongshu_shopping.js';
import * as douyin from './douyin_entertainment.js';
import * as bilibili from './bilibili_social.js';
import * as weibo from './weibo_social.js';
import * as mall from './shopping_mall.js';
import * as ugc from './community_stub.js';

/** 默认启用（不含预留视频号/公众号，避免空跑） */
const ALL = [
  dianping,
  meituan,
  eleme,
  ctrip,
  tujia,
  lvmama,
  hema,
  missfresh,
  mall,
  xhs,
  douyin,
  bilibili,
  weibo,
  ugc,
];

function envEnabled(name) {
  const raw = process.env.ENABLED_SOURCES;
  if (!raw) return true;
  return raw.split(',').map((s) => s.trim()).includes(name);
}

export const CRAWLERS = ALL.filter((c) => envEnabled(c.name));

export function listSources() {
  return CRAWLERS.map((c) => ({
    id: c.name,
    label: c.label,
    types: c.types,
  }));
}

export function selectCrawlers(scenes, sourcePref) {
  const expanded = scenes.includes('all')
    ? ['stay', 'dining', 'coffee', 'entertainment', 'shopping']
    : scenes;
  return CRAWLERS.filter((c) => {
    if (sourcePref === 'platform' && !c.types.includes('platform')) return false;
    if (sourcePref === 'social' && !c.types.includes('social')) return false;
    if (sourcePref === 'community' && !c.types.includes('community')) return false;
    if (c.scenes?.includes('*')) return true;
    return expanded.some((s) => c.scenes?.includes(s));
  });
}
