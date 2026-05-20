const { pickRandom, SEED } = require('../../utils/deals.js');
const { randomSign, randomEmpty } = require('../../utils/fortune.js');
const api = require('../../utils/api.js');

const BOTTLE_META = [
  { scene: 'coffee', color: 'orange', left: 8 },
  { scene: 'pet', color: 'yellow', left: 28 },
  { scene: 'expiring', color: 'green', left: 48 },
  { scene: 'stay', color: 'blue', left: 68 },
  { scene: 'entertainment', color: 'purple', left: 82 },
];

const DAILY_LIMIT = 3;

Page({
  data: {
    poolCount: 0,
    remain: DAILY_LIMIT,
    bottles: [],
    picking: false,
    showSlip: false,
    lastPick: null,
    pickScene: 'all',
  },

  onLoad() {
    this.setData({
      poolCount: SEED.length,
      bottles: BOTTLE_META.map((b, i) => ({ ...b, delay: i * 0.4 })),
    });
    this.refreshRemain();
  },

  onShow() {
    this.refreshRemain();
  },

  refreshRemain() {
    const today = new Date().toISOString().slice(0, 10);
    let saved = wx.getStorageSync('jiegasuan_bottle_day');
    let remain = wx.getStorageSync('jiegasuan_bottle_remain');
    if (saved !== today) {
      remain = DAILY_LIMIT;
      wx.setStorageSync('jiegasuan_bottle_day', today);
      wx.setStorageSync('jiegasuan_bottle_remain', remain);
    }
    this.setData({ remain: remain ?? DAILY_LIMIT });
  },

  useOnePick() {
    const remain = Math.max(0, this.data.remain - 1);
    wx.setStorageSync('jiegasuan_bottle_remain', remain);
    this.setData({ remain });
  },

  onPickBottle(e) {
    this.setData({ pickScene: e.currentTarget.dataset.scene || 'all' });
    this.doPick();
  },

  onPick() {
    this.setData({ pickScene: 'all' });
    this.doPick();
  },

  doPick() {
    if (this.data.remain <= 0) {
      wx.showToast({ title: '今朝次数用完啦', icon: 'none' });
      return;
    }
    this.setData({ picking: true });
    const scene = this.data.pickScene;

    api
      .getBottleRandom()
      .then((remote) => {
        if (remote && remote.empty) {
          return this.showResult({
            empty: true,
            sign: remote.fortune?.sign || '空瓶',
            text: remote.fortuneText || randomEmpty(),
          });
        }
        if (remote && remote.data) {
          const sign = remote.data.fortune || randomSign();
          return this.showResult({
            empty: false,
            sign: sign.sign,
            title: remote.data.title || remote.data.merchantName,
            discountText: remote.data.discountText,
            human: sign.text,
            source: remote.data.platformLabel || '精选',
            raw: remote.data,
          });
        }
        return this.pickLocal(scene);
      })
      .catch(() => this.pickLocal(scene))
      .finally(() => this.setData({ picking: false }));
  },

  pickLocal(scene) {
    if (Math.random() < 0.1) {
      const sign = randomSign();
      return this.showResult({
        empty: true,
        sign: sign.sign,
        text: randomEmpty(),
      });
    }
    const deal = pickRandom(scene);
    const sign = randomSign();
    return this.showResult({
      empty: false,
      sign: sign.sign,
      title: deal.title,
      discountText: deal.discountText,
      human: `${sign.text} ${deal.quote}`,
      source: deal.source,
      raw: deal,
    });
  },

  showResult(lastPick) {
    this.useOnePick();
    const history = wx.getStorageSync('jiegasuan_bottle_history') || [];
    history.push({ ...lastPick, at: Date.now() });
    wx.setStorageSync('jiegasuan_bottle_history', history);
    this.setData({ lastPick, showSlip: true, picking: false });
  },

  closeSlip() {
    this.setData({ showSlip: false });
  },
});
