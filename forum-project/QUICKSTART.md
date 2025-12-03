# 🚀 快速入门指南 - 论坛网站

## 📦 项目已成功创建！

你的全栈论坛网站项目框架已完成搭建。以下是快速开始的步骤：

---

## ⚡ 30 秒快速开始

### 1️⃣ 安装 Node.js（如果还未安装）
- 下载: https://nodejs.org/ (LTS 版本)
- 安装完成后，验证：`node --version` 和 `npm --version`

### 2️⃣ 安装 MongoDB（可选，可用在线 MongoDB Atlas）
- 本地: https://www.mongodb.com/try/download/community
- 云服务: https://www.mongodb.com/cloud/atlas (推荐)

### 3️⃣ 启动后端
```bash
cd backend
npm install
npm run dev
```
✅ 后端在 http://localhost:5000

### 4️⃣ 启动前端（新终端）
```bash
cd frontend
npm install
npm run dev
```
✅ 前端在 http://localhost:3000

### 5️⃣ 打开浏览器
访问 **http://localhost:3000**

---

## 🎯 核心功能

✨ **现已可用**:
- ✅ 用户注册、登录
- ✅ 发布帖子
- ✅ 添加评论
- ✅ 实时聊天基础

🚀 **待开发**:
- 📝 前端页面和组件
- 🎨 UI/UX 美化
- 🔍 搜索和过滤
- 👍 点赞功能

---

## 📚 关键文件

| 文件 | 用途 |
|------|------|
| `README.md` | 完整项目文档 |
| `SETUP.md` | 详细设置指南 |
| `.github/copilot-instructions.md` | AI 开发指导 |
| `todo.md` | 任务清单 |
| `backend/server.js` | 后端主文件 |
| `frontend/app/` | 前端页面 |

---

## 🛠️ 常用命令

```bash
# 后端开发
cd backend
npm run dev      # 启动开发服务器
npm test         # 运行测试
npm run build    # 生产构建

# 前端开发
cd frontend
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm test         # 运行测试
```

---

## 🔑 环境变量

### 后端 (`backend/.env.local`)
```env
MONGODB_URI=mongodb://localhost:27017/forum_db
JWT_SECRET=change-this-secret-key
PORT=5000
```

### 前端 (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## 🎓 测试账户

注册后创建测试账户进行功能测试：
- 用户名: `testuser`
- 邮箱: `test@example.com`
- 密码: `password123`

---

## 💻 使用 VS Code 任务

### 快速开始所有服务
按 `Ctrl+Shift+P` → 输入 "Run Task" → 选择 "Start All Services"

### 其他可用任务
- "Install All Dependencies" - 安装所有依赖
- "Backend: Start Dev Server" - 仅启动后端
- "Frontend: Start Dev Server" - 仅启动前端
- "Backend: Run Tests" - 后端测试
- "Frontend: Run Tests" - 前端测试

---

## ⚠️ 常见问题

### ❌ "npm 不是有效命令"
→ 安装 Node.js：https://nodejs.org/

### ❌ "MongoDB 连接失败"
→ 确保 MongoDB 已启动，或使用 MongoDB Atlas

### ❌ "端口已被占用"
→ 更改 `.env.local` 中的 PORT，或杀死占用进程

### ❌ "Token 无效"
→ 清除浏览器 localStorage 并重新登录

更多帮助，查看 `SETUP.md`

---

## 📖 学习资源

- Next.js: https://nextjs.org/docs
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Socket.io: https://socket.io/docs/

---

## 🎉 下一步

1. ✅ 启动前后端服务
2. 📝 查看 `todo.md` 了解开发任务
3. 🧑‍💻 开始实现前端页面
4. 🔌 集成 API 调用
5. 🎨 美化用户界面

---

## 📞 需要帮助?

- 查看 `SETUP.md` 获取详细指导
- 查看 `.github/copilot-instructions.md` 获取代码规范
- 查看 `README.md` 获取 API 文档

---

**项目创建于**: 2025-12-03  
**框架状态**: ✅ 完成  
**开发状态**: 🟡 就绪  

祝你开发愉快！🚀
