/**
 * 小程序 = web-view 打开线上介嘎算 H5（与 Render 同域 /api）
 * 地址来自 share.config.js（由 deploy.config.json 同步）
 */
const DEFAULT_URL = 'https://jiegasuan.onrender.com';

function resolveH5Url() {
  try {
    const cfg = require('../../share.config.js');
    if (cfg && cfg.h5Url) return cfg.h5Url.replace(/\/$/, '');
  } catch (_) {}
  return DEFAULT_URL;
}

Page({
  data: {
    url: '',
    showHelp: false,
  },
  onLoad() {
    const url = resolveH5Url();
    this.setData({ url, showHelp: false });
  },
  onWebLoad() {
    this.setData({ showHelp: false });
  },
  onWebError() {
    const url = resolveH5Url();
    wx.showModal({
      title: '页面未加载',
      content:
        '请确认线上已部署：' +
        url +
        '\n\n开发者工具请勾选「不校验合法域名」。正式版须在公众平台配置业务域名：' +
        url.replace(/^https:\/\//, ''),
      showCancel: false,
    });
    this.setData({ showHelp: true });
  },
  onRetry() {
    this.setData({ url: resolveH5Url(), showHelp: false });
  },
  onShareAppMessage() {
    const url = resolveH5Url();
    return {
      title: '介嘎算 · 奉贤生活样样介嘎算',
      path: '/pages/webhome/webhome',
      imageUrl: '',
    };
  },
  onShareTimeline() {
    return {
      title: '介嘎算 · 奉贤街坊好价',
    };
  },
});
