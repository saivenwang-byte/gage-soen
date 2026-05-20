const api = require('../../utils/api.js');
const { SCENES } = require('../../utils/deals.js');

const DISTANCES = [5, 10, 15];

Page({
  data: {
    scenes: SCENES,
    scene: 'all',
    keyword: '',
    distance: 15,
    distanceIdx: 2,
    items: [],
    loading: false,
  },

  onLoad() {
    this.loadFavIds();
    this.onSearch();
  },

  onShow() {
    this.markFavorites();
  },

  onPullDownRefresh() {
    this.onSearch().finally(() => wx.stopPullDownRefresh());
  },

  loadFavIds() {
    this.favIds = wx.getStorageSync('jiegasuan_favorites') || [];
  },

  markFavorites() {
    const ids = this.favIds || [];
    const items = (this.data.items || []).map((it) => ({
      ...it,
      _fav: ids.includes(it.id),
    }));
    this.setData({ items });
  },

  onKeyword(e) {
    this.setData({ keyword: e.detail.value });
  },

  onScene(e) {
    this.setData({ scene: e.currentTarget.dataset.key });
    this.onSearch();
  },

  onDistance(e) {
    const idx = Number(e.detail.value);
    this.setData({ distanceIdx: idx, distance: DISTANCES[idx] });
    this.onSearch();
  },

  onSearch() {
    this.setData({ loading: true });
    return api
      .getDeals({
        scene: this.data.scene,
        keyword: this.data.keyword,
        distance: this.data.distance,
      })
      .then((items) => {
        this.setData({ items, loading: false });
        this.markFavorites();
      })
      .catch(() => {
        this.setData({ items: [], loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onFav(e) {
    const item = e.currentTarget.dataset.item;
    let ids = wx.getStorageSync('jiegasuan_favorites') || [];
    let list = wx.getStorageSync('jiegasuan_fav_list') || [];
    if (ids.includes(item.id)) {
      ids = ids.filter((id) => id !== item.id);
      list = list.filter((x) => x.id !== item.id);
      wx.showToast({ title: '已取消', icon: 'none' });
    } else {
      ids.push(item.id);
      list.push(item);
      wx.showToast({ title: '已收藏', icon: 'none' });
    }
    wx.setStorageSync('jiegasuan_favorites', ids);
    wx.setStorageSync('jiegasuan_fav_list', list);
    this.favIds = ids;
    this.markFavorites();
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${item.id}`,
      success(res) {
        res.eventChannel.emit('deal', item);
      },
    });
  },
});
