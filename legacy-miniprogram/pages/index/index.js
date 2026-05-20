const api = require('../../utils/api');

const CATEGORY_ALL = '';

Page({
  data: {
    categories: [],
    activeCategory: CATEGORY_ALL,
    headcount: 4,
    travelDate: '',
    keyword: '',
    maxPerCapita: '',
    sortBy: 'score',
    items: [],
    loading: false,
    error: ''
  },

  onLoad() {
    api.getCategories().then((list) => {
      this.setData({ categories: list });
    }).catch(() => {
      this.setData({
        categories: [
          { id: 'stay', name: '住', icon: '🏨' },
          { id: 'food', name: '吃', icon: '🍜' },
          { id: 'travel', name: '行', icon: '🚌' },
          { id: 'play', name: '玩', icon: '🎯' }
        ]
      });
    });
  },

  onShow() {
    this.fetchDeals();
  },

  onPullDownRefresh() {
    this.fetchDeals().finally(() => wx.stopPullDownRefresh());
  },

  buildParams() {
    const p = {
      district: '奉贤区',
      headcount: this.data.headcount,
      sort_by: this.data.sortBy
    };
    if (this.data.activeCategory) p.category = this.data.activeCategory;
    if (this.data.travelDate) p.travel_date = this.data.travelDate;
    if (this.data.keyword) p.keyword = this.data.keyword;
    if (this.data.maxPerCapita) p.max_per_capita = Number(this.data.maxPerCapita);
    return p;
  },

  fetchDeals() {
    this.setData({ loading: true, error: '' });
    return api.compareDeals(this.buildParams())
      .then((res) => {
        this.setData({ items: res.items || [], loading: false });
      })
      .catch((err) => {
        this.setData({
          loading: false,
          error: '无法连接比价服务，请先启动后端（见 README）',
          items: []
        });
        console.error(err);
      });
  },

  onHeadcount(e) {
    this.setData({ headcount: e.detail.value });
    this.fetchDeals();
  },

  onDate(e) {
    this.setData({ travelDate: e.detail.value });
    this.fetchDeals();
  },

  onKeyword(e) {
    this.setData({ keyword: e.detail.value });
  },

  onKeywordConfirm() {
    this.fetchDeals();
  },

  onMaxPrice(e) {
    this.setData({ maxPerCapita: e.detail.value });
  },

  onCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    this.fetchDeals();
  },

  onSort(e) {
    this.setData({ sortBy: e.currentTarget.dataset.sort });
    this.fetchDeals();
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${item.id}`,
      success(res) {
        res.eventChannel.emit('deal', item);
      }
    });
  }
});
