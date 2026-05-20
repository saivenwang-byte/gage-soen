Page({
  data: { deal: null },

  onLoad() {
    const ch = this.getOpenerEventChannel();
    ch.on('deal', (deal) => {
      this.setData({ deal });
    });
  }
});
