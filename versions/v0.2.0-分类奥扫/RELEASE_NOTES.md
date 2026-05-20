# v0.2.0 · 分类奥扫与精选数据

- **路径说明**：历史版次记录；完整代码以主线为准，或运行 `scripts\snapshot-version.ps1` 生成快照。
- **主线**：`d:\【私人】\【外婆闺蜜比价】`

## 本版要点

- 关键词搜索改为场景 + 子类标签（`SceneSubPicker`）
- `backend\data\deals.seed.json` 精选池
- 修复 `dealsStore.js` 中 `matchScene` 变量遮蔽导致查询失败
- `npm run validate:coverage` 子类非空校验
