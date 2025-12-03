<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 论坛网站项目 - AI 代理指导文档

## 项目概览

**项目类型**: 全栈论坛式网站  
**技术栈**: Next.js (前端) + Express.js (后端) + MongoDB (数据库)  
**主要功能**:
- 用户注册、登录、身份认证
- 发布帖子和评论
- 实时聊天功能
- 用户互动和社区管理

## 项目结构

```
forum-website/
├── frontend/              # Next.js 前端应用
│   ├── app/              # Next.js 应用目录
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数和 API 客户端
│   └── public/           # 静态资源
├── backend/              # Express.js 后端 API
│   ├── models/           # MongoDB 数据模型
│   ├── routes/           # API 路由
│   ├── controllers/      # 业务逻辑控制器
│   ├── middleware/       # 中间件（认证等）
│   └── server.js         # 主服务器文件
├── .github/              # GitHub 配置
│   └── copilot-instructions.md  # 本文件
└── todo.md              # 任务追踪文件
```

## 核心工作流

### 1. 项目初始化
```bash
# 前端初始化
cd frontend
npm install
npm run dev  # 开发模式，端口 3000

# 后端初始化
cd backend
npm install
npm run dev  # 开发模式，端口 5000
```

### 2. 数据库连接
- MongoDB 连接字符串配置在后端 `.env` 文件中
- 环境变量: `MONGODB_URI`
- 默认数据库名称: `forum_db`

### 3. 认证流程
- 前端使用 JWT token 存储在 localStorage
- 后端验证 token 在 `middleware/auth.js` 中
- API 请求头需要包含: `Authorization: Bearer <token>`

## 代码规范

### 命名约定
- **文件名**: `camelCase` (例如: `userController.js`)
- **组件名**: `PascalCase` (例如: `UserProfile.jsx`)
- **变量/函数**: `camelCase` (例如: `fetchUserPosts()`)
- **常量**: `UPPER_SNAKE_CASE` (例如: `API_BASE_URL`)

### 文件组织
- **后端**: 按功能分组 (models, routes, controllers)
- **前端**: 按页面和组件分组 (app, components)
- 共享代码放在 `lib/` 目录

### 错误处理
- 后端: 返回标准 JSON 格式: `{ success: false, message: "...", error: {...} }`
- 前端: 使用 try-catch 和 error boundary 组件
- 日志: 使用 console.log (开发) 和 winston (生产)

## 关键集成点

### 前后端通信
- **基础 URL**: `http://localhost:5000/api` (开发环境)
- **请求方式**: RESTful API
- **认证**: JWT Token in Authorization header

### 数据库操作
- **ORM**: Mongoose (MongoDB ODM)
- **模型位置**: `backend/models/`
- **数据验证**: Mongoose schema validation

### 实时功能 (未来实现)
- **WebSocket**: Socket.io 用于聊天功能
- **连接**: `ws://localhost:5000`

## 开发命令

| 命令 | 说明 | 位置 |
|------|------|------|
| `npm install` | 安装依赖 | 前端/后端 |
| `npm run dev` | 开发模式 | 前端/后端 |
| `npm test` | 运行测试 | 前端/后端 |
| `npm run build` | 生产构建 | 前端/后端 |

## 常见 API 端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/posts` - 获取所有帖子
- `POST /api/posts` - 创建新帖子
- `GET /api/posts/:id/comments` - 获取帖子评论
- `POST /api/posts/:id/comments` - 添加评论

## 扩展性和维护

- 添加新 API 端点时，在 `backend/routes/` 中创建新的路由文件
- 添加新组件时，在 `frontend/components/` 中创建新文件夹并遵循已有模式
- 更新此文件以反映重要的架构变更

## AI 代理提示

在修改代码时，请：
1. 查阅相关模块的既有代码以理解模式
2. 遵循上述命名规范和文件组织方式
3. 确保前后端版本的认证实现一致
4. 测试 API 路由在添加/修改后是否正常工作
5. 更新 README.md 和本文件中的相关文档

---

**最后更新**: 2025-12-03
