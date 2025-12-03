# 部署指南 - 将论坛网站部署到公网

本指南将帮助你将论坛项目部署到公网，完全免费！

## 📋 部署架构

- **前端**: Vercel（Next.js 官方推荐，零配置）
- **后端**: Render（支持 Node.js，免费 HTTPS）
- **数据库**: MongoDB Atlas（云数据库，512MB 免费额度）

---

## 第一步：配置 MongoDB Atlas 云数据库

### 1. 注册并创建集群

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas/database) 并注册账号
2. 创建免费集群：
   - 选择 **M0 级别**（Free）
   - 区域选择 **新加坡**或其他就近区域
   - 集群名称：自定义（如 `forum-cluster`）

### 2. 配置数据库访问

1. **网络访问**（Network Access）：
   - 点击左侧 "Network Access"
   - 点击 "Add IP Address"
   - 选择 "Allow Access from Anywhere" （添加 `0.0.0.0/0`）
   - 点击 "Confirm"

2. **数据库用户**（Database Access）：
   - 点击左侧 "Database Access"
   - 点击 "Add New Database User"
   - 认证方式选择 "Password"
   - 设置用户名（如 `forumUser`）和密码（务必记住！）
   - 权限选择 "Read and write to any database"
   - 点击 "Add User"

### 3. 获取连接字符串

1. 回到 "Database" 页面，点击 "Connect"
2. 选择 "Connect your application"
3. Driver 选择 "Node.js"，Version 选择最新版
4. 复制连接字符串，类似：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **重要**：将 `<username>` 和 `<password>` 替换为你刚才创建的用户名和密码
6. 在 `mongodb.net/` 后面添加数据库名，例如：
   ```
   mongodb+srv://forumUser:yourpassword@cluster0.xxxxx.mongodb.net/forum?retryWrites=true&w=majority
   ```

---

## 第二步：部署后端到 Render

### 1. 注册 Render 账号

1. 访问 [Render](https://render.com/)
2. 点击 "Get Started" 或 "Sign Up"
3. **使用 GitHub 账号登录**（自动关联仓库）

### 2. 创建 Web Service

1. 点击 "New +" → "Web Service"
2. 选择你的 GitHub 仓库 `forum-project`
3. 填写配置信息：
   - **Name**: `forum-backend`（自定义）
   - **Region**: `Singapore`（与 MongoDB 同区域）
   - **Branch**: `master`
   - **Root Directory**: `backend`（重要！）
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

### 3. 配置环境变量

在 "Environment Variables" 部分，点击 "Add Environment Variable"，添加以下变量：

| Key | Value |
|-----|-------|
| `MONGODB_URI` | 第一步复制的 MongoDB Atlas 连接字符串 |
| `JWT_SECRET` | 自定义密钥，如 `forum-jwt-2025!@#`（保持与本地一致） |
| `PORT` | `10000`（Render 默认，可不填） |
| `CLIENT_URL` | `https://forum-frontend.vercel.app`（先填占位符，前端部署后替换） |

### 4. 部署

1. 点击 "Create Web Service"
2. 等待部署完成（约 3-5 分钟）
3. 部署成功后，记下你的后端域名，类似：
   ```
   https://forum-backend.onrender.com
   ```

---

## 第三步：部署前端到 Vercel

### 1. 注册 Vercel 账号

1. 访问 [Vercel](https://vercel.com/)
2. 点击 "Sign Up"
3. **使用 GitHub 账号登录**

### 2. 导入项目

1. 点击 "Add New..." → "Project"
2. 在列表中找到 `forum-project` 仓库，点击 "Import"
3. 配置项目：
   - **Framework Preset**: `Next.js`（自动检测）
   - **Root Directory**: `frontend`（点击 "Edit" 修改）
   - **Build Command**: `npm run build`（自动填充）
   - **Output Directory**: `.next`（自动填充）

### 3. 配置环境变量

在 "Environment Variables" 部分，添加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://forum-backend.onrender.com/api`（替换为你的 Render 后端域名） |

### 4. 部署

1. 点击 "Deploy"
2. 等待构建和部署完成（约 2-3 分钟）
3. 部署成功后，Vercel 会生成前端域名，类似：
   ```
   https://forum-project.vercel.app
   ```

---

## 第四步：打通前后端连接

### 1. 更新 Render 环境变量

1. 回到 Render 的后端项目页面
2. 点击左侧 "Environment"
3. 找到 `CLIENT_URL` 变量，点击编辑
4. 将值更新为 Vercel 前端域名：
   ```
   https://forum-project.vercel.app
   ```
5. 保存后，Render 会自动重新部署

### 2. 验证 CORS 配置

确保后端 `server.js` 中的 CORS 配置正确：

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));
```

---

## 第五步：测试公网访问

1. 打开前端 Vercel 域名（如 `https://forum-project.vercel.app`）
2. 测试功能：
   - ✅ 用户注册
   - ✅ 用户登录
   - ✅ 创建帖子
   - ✅ 查看帖子详情
   - ✅ 发表评论

3. 验证数据库：
   - 登录 MongoDB Atlas
   - 点击 "Browse Collections"
   - 查看 `forum` 数据库中的 `users`、`posts`、`comments` 集合
   - 确认有新数据写入

---

## 🎉 部署完成！

你的论坛网站现在已经部署到公网，可以分享给朋友访问了！

### 访问地址

- **前端**: https://你的项目名.vercel.app
- **后端 API**: https://你的项目名.onrender.com/api
- **健康检查**: https://你的项目名.onrender.com/api/health

---

## 📌 注意事项

### 免费版限制

1. **Render 免费版**：
   - 服务闲置 15 分钟会自动休眠
   - 首次访问可能需要等待 30-60 秒唤醒
   - 解决方案：刷新页面或使用 UptimeRobot 定时 ping

2. **Vercel 免费版**：
   - 无休眠问题
   - 月流量 100GB（个人使用足够）

3. **MongoDB Atlas 免费版**：
   - 存储空间 512MB
   - 足够个人测试和小型项目使用

### 环境变量管理

- 本地开发使用 `.env.local`（不上传到 Git）
- 生产环境在平台配置环境变量
- 敏感信息（密码、密钥）务必妥善保管

### 更新部署

- **前端**：推送代码到 GitHub，Vercel 自动重新部署
- **后端**：推送代码到 GitHub，Render 自动重新部署
- **手动部署**：在平台点击 "Redeploy" 按钮

---

## 🔧 常见问题

### 1. 前端无法连接后端

**症状**：注册/登录失败，控制台显示 CORS 错误

**解决**：
1. 检查 Render 后端环境变量 `CLIENT_URL` 是否正确
2. 检查 Vercel 前端环境变量 `NEXT_PUBLIC_API_BASE_URL` 是否正确
3. 确保后端 CORS 配置包含前端域名

### 2. Render 服务频繁休眠

**症状**：首次访问很慢，显示 "Waking up service"

**解决**：
- 使用 [UptimeRobot](https://uptimerobot.com/) 每 5 分钟 ping 一次后端
- 或升级到 Render 付费版（$7/月）

### 3. MongoDB 连接失败

**症状**：后端日志显示 "MongoServerError"

**解决**：
1. 检查 MongoDB Atlas IP 白名单是否添加 `0.0.0.0/0`
2. 检查连接字符串是否正确（用户名、密码、数据库名）
3. 确保数据库用户权限为 "Read and write to any database"

### 4. 环境变量不生效

**症状**：代码访问 `process.env.XXX` 为 undefined

**解决**：
- **前端**：环境变量必须以 `NEXT_PUBLIC_` 开头
- **后端**：在平台重新保存环境变量后，需要手动重新部署
- 检查拼写和大小写是否正确

---

## 🚀 进阶优化

### 1. 自定义域名

- **Vercel**: Settings → Domains → 添加自定义域名
- **Render**: Settings → Custom Domain → 添加自定义域名

### 2. 监控和日志

- **Vercel**: 自带日志查看功能
- **Render**: Logs 页面查看实时日志
- **MongoDB Atlas**: Metrics 页面监控数据库性能

### 3. 性能优化

- 前端添加 Next.js 图片优化
- 后端添加 Redis 缓存（Render 付费版支持）
- 数据库添加索引提升查询速度

---

**部署完成后，别忘了在 GitHub README 中添加在线演示链接！** 🎉
