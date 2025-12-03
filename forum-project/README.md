# 论坛网站项目

一个现代化的全栈论坛社区网站，支持用户认证、发布帖子、评论互动和实时聊天。

## 🎯 主要功能

- ✅ 用户注册、登录和身份认证
- ✅ 发布和管理帖子
- ✅ 评论和互动
- ✅ 实时聊天功能（Socket.io）
- ✅ 用户信息管理

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 样式库

### 后端
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 框架
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **Socket.io** - 实时通信
- **JWT** - 身份认证

## 📦 项目结构

```
forum-website/
├── frontend/              # Next.js 前端应用
│   ├── app/              # Next.js App Router
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数
│   ├── public/           # 静态资源
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/              # Express.js 后端 API
│   ├── models/           # MongoDB 数据模型
│   ├── routes/           # API 路由
│   ├── controllers/      # 业务逻辑
│   ├── middleware/       # 中间件
│   ├── server.js         # 主服务器
│   ├── package.json
│   └── .env.local
│
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- MongoDB 本地服务运行（或云 MongoDB）
- npm 或 yarn

### 安装和运行

#### 后端设置
```bash
cd backend
npm install
npm run dev
# 服务器将在 http://localhost:5000 运行
```

#### 前端设置
```bash
cd frontend
npm install
npm run dev
# 应用将在 http://localhost:3000 运行
```

## 📚 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 帖子相关
- `GET /api/posts` - 获取所有帖子
- `POST /api/posts` - 创建新帖子
- `GET /api/posts/:id` - 获取单个帖子
- `DELETE /api/posts/:id` - 删除帖子

### 评论相关
- `POST /api/posts/:postId/comments` - 添加评论
- `DELETE /api/posts/:postId/comments/:commentId` - 删除评论

## 🔐 身份认证

- 使用 JWT Token 进行身份认证
- Token 存储在 localStorage
- 所有需要认证的请求都需要在 Authorization header 中包含 Bearer token

示例：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 环境变量

### 后端 (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/forum_db
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

### 前端 (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## 🧪 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 📂 数据库模型

### User
- username (String, unique)
- email (String, unique)
- password (String, hashed)
- avatar (String, optional)
- bio (String, optional)
- createdAt, updatedAt (Timestamps)

### Post
- title (String)
- content (String)
- author (ObjectId, ref: User)
- comments (Array of ObjectId, ref: Comment)
- likes (Number)
- views (Number)
- createdAt, updatedAt (Timestamps)

### Comment
- content (String)
- author (ObjectId, ref: User)
- post (ObjectId, ref: Post)
- likes (Number)
- createdAt, updatedAt (Timestamps)

## 🤝 代码规范

- 后端文件使用 `camelCase` 命名 (如: `userController.js`)
- 前端组件使用 `PascalCase` 命名 (如: `UserProfile.tsx`)
- 所有 API 响应格式: `{ success: boolean, message: string, data?: any }`
- 错误处理: 统一的错误响应格式

## 📖 更新日志

### v0.1.0 (2025-12-03)
- ✨ 初始项目结构搭建
- ✨ 用户认证系统
- ✨ 帖子和评论功能
- ✨ 实时聊天基础架构

## 📄 许可证

MIT

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！

---

**开发指南**: 查看 `.github/copilot-instructions.md` 获取更多 AI 代理开发指导。
