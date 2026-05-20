# 介嘎算微信小程序（web-view 壳）

内嵌线上 H5，与 Render 部署的 **https://jiegasuan.onrender.com** 同源。

## 使用

1. 微信开发者工具 → 导入本目录
2. `project.config.json` 填写真实 **AppID**
3. 公众平台配置 **业务域名**：`jiegasuan.onrender.com`
4. 编译 → 预览 / 转发给朋友

`share.config.js` 由仓库根目录 `deploy.config.json` 自动同步，勿手改。

## 分享

页面已实现 `onShareAppMessage`，可直接转发小程序卡片。
