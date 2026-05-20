# 04 · API 接口（后端 Express，默认端口 3001）

## 健康检查

- `GET /health`  
- `GET /api/health`

## 优惠查询

- `GET /api/deals?scene=&subCategory=&distance=&lat=&lng=`  
  返回精选池 + 已提交 UGC（内存）

## 漂流瓶

- `GET /api/bottle/count?lat&lng&distance&scene&subCategory`  
- `GET /api/bottle/random?...&mode=`  
  - 空：`{ empty: true, fortuneText, fortune? }`  
  - 有货：`{ empty: false, data: { ...deal, fortune } }`

## 家人上传（重要）

- **`POST /api/ugc`**  
  Body JSON 示例：

```json
{
  "scene": "expiring",
  "merchantName": "夏小姐的花店",
  "address": "海马路4333号",
  "promoText": "狗来人可以不来",
  "price": 80,
  "submitter": "夏老板"
}
```

  成功：`{ success: true, message: "...", item: {...} }`  

- 兼容旧路径：`POST /api/ugc/report`

前端 `API_BASE` 默认 `/api`（Vite 代理到 3001）。**仅静态预览 5174 无代理 → 会 404**，前端已 fallback 到 `localUgc.js`。

## 许愿

- `GET /api/wish`  
- `POST /api/wish`  
- `POST /api/wish/:id/support`

## 搜索任务（可选爬虫模式）

- `POST /api/search` → `{ jobId }`  
- `GET /api/search/:jobId`  
- WebSocket `/ws?jobId=`

## 元数据

- `GET /api/meta/scenes`  
- `GET /api/meta/towns`
