# 后端接口定义与前后端对接说明

本文档面向 **English Beater** 项目，定义后端 API 协议，并说明前端（Web/小程序）如何对接。  
后端实现位置：`backend/`，入口文件：`backend/api/index.ts`。

---

## 1. 基础信息

- **API Base URL**
  - 本地开发：`http://localhost:3000`
  - Serverless：`https://<你的域名>`
- **统一响应格式**
```json
{
  "message": "ok",
  "data": {}
}
```

- **统一错误格式**
```json
{
  "message": "error message"
}
```

---

## 2. 鉴权说明

### 2.1 登录流程（微信小程序）
1. 小程序端调用 `wx.login` 获取 `code`
2. 调用 `POST /api/auth/login`
3. 返回 `token` 与 `openid`
4. 后续 API 调用携带：
```
Authorization: Bearer <token>
```

### 2.2 本地开发快捷方式
为了方便联调，后端允许传 `code=mock`，直接返回模拟 `openid`。

---

## 3. API 列表

### 3.1 健康检查
**GET /api/health**  
Response:
```json
{
  "status": "ok"
}
```

---

### 3.2 微信登录
**POST /api/auth/login**  
Body:
```json
{
  "code": "wx-login-code"
}
```
Response:
```json
{
  "message": "ok",
  "data": {
    "openid": "openid_xxx",
    "token": "jwt_token_here",
    "expiresIn": 604800
  }
}
```

---

### 3.3 词库查询
**GET /api/dictionary**  
Query 参数：
- `level`：`CET-4 | CET-6 | IELTS | Daily`
- `pos`：词性，如 `n.` / `v.` / `adj.`
- `sentiment`：`positive | neutral | negative`
- `theme`：主题，如 `Daily | Work | Academic`
- `q`：关键词搜索
- `page`：页码（默认 1）
- `pageSize`：每页数量（默认 20）

Response:
```json
{
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "w1",
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "pos": "v. / n.",
        "translation": "放弃；抛弃",
        "example": "They had to abandon their car in the snow.",
        "level": "CET-4",
        "sentiment": "negative",
        "theme": "Daily"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 2000
  }
}
```

---

### 3.4 题库生成
**GET /api/game/questions**  
Query 参数：
- `level`：题目难度等级
- `round`：轮次编号（前端传即可，后端返回原值）

Response:
```json
{
  "message": "ok",
  "data": {
    "round": 1,
    "questions": [
      {
        "id": "single-0-xxxx",
        "type": "single",
        "prompt": "Choose the correct translation",
        "word": { "id": "w1", "word": "abandon", "phonetic": "/əˈbændən/" },
        "options": [
          { "id": "w1", "word": "abandon", "translation": "放弃；抛弃" },
          { "id": "w2", "word": "ability", "translation": "能力；才能" }
        ],
        "correctAnswerIds": ["w1"]
      },
      {
        "id": "multiple-8-xxxx",
        "type": "multiple",
        "prompt": "Select all positive/neutral words",
        "options": [
          { "id": "w2", "word": "ability", "translation": "能力；才能" }
        ],
        "correctAnswerIds": ["w2"]
      }
    ]
  }
}
```

---

### 3.5 用户学习进度（获取）
**GET /api/user/progress**  
Header:
```
Authorization: Bearer <token>
```
Response:
```json
{
  "message": "ok",
  "data": {
    "userId": "openid_xxx",
    "starred": ["w1"],
    "favourites": ["w2"],
    "notes": { "w1": "abandon=放弃" },
    "updatedAt": "2026-03-30T12:30:00Z"
  }
}
```

---

### 3.6 用户学习进度（保存）
**POST /api/user/progress**  
Header:
```
Authorization: Bearer <token>
```
Body:
```json
{
  "starred": ["w1", "w9"],
  "favourites": ["w2"],
  "notes": { "w2": "ability=能力" }
}
```
Response:
```json
{
  "message": "ok",
  "data": {
    "userId": "openid_xxx",
    "starred": ["w1", "w9"],
    "favourites": ["w2"],
    "notes": { "w1": "abandon=放弃", "w2": "ability=能力" },
    "updatedAt": "2026-03-30T12:30:00Z"
  }
}
```

---

## 4. 前后端对接流程（推荐）

### 4.1 小程序端
1. 登录时：`wx.login` → `POST /api/auth/login`
2. 保存 `token`
3. 进入游戏前：
   - `GET /api/game/questions?level=CET-4&round=1`
4. 进入词库：
   - `GET /api/dictionary?level=CET-4&page=1&pageSize=20`
5. 学习记录更新：
   - `POST /api/user/progress`

### 4.2 Web 前端
1. 应用初始化时调用登录接口（开发阶段可传 `code=mock`）
2. 缓存 `token`（localStorage 或 Zustand）
3. 后续请求附带 `Authorization` 头

---

## 5. 请求示例

### 5.1 Web (fetch)
```ts
const token = localStorage.getItem('token');
const res = await fetch(`${API_BASE}/api/dictionary?level=CET-4`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
```

### 5.2 微信小程序 (wx.request)
```js
wx.request({
  url: `${API_BASE}/api/user/progress`,
  method: 'POST',
  header: {
    Authorization: `Bearer ${token}`
  },
  data: {
    starred: ['w1'],
    favourites: ['w2'],
    notes: { w1: 'abandon=放弃' }
  },
  success: (res) => console.log(res.data)
})
```

---

## 6. 注意事项

- **小程序域名白名单**：需在微信公众平台配置 HTTPS 域名。
- **冷启动**：Serverless 首次请求可能慢，前端可提前预热题库。
- **当前进度存储**：本地版本使用内存存储，正式上线需替换为数据库。

