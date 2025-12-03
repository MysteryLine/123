# 新功能说明 - 点赞、头像和用户资料

## 🎉 更新内容 (2025-12-03)

### 1️⃣ 点赞功能

#### 后端实现
- **数据模型更新**:
  - `Post.likes` 和 `Comment.likes` 从 Number 改为 User ID 数组
  - 可以精确追踪哪些用户点赞了内容
  
- **新增 API 端点**:
  ```
  POST /api/posts/:id/like              - 点赞/取消点赞帖子
  POST /api/posts/:postId/comments/:commentId/like - 点赞/取消点赞评论
  ```

- **返回数据**:
  ```json
  {
    "success": true,
    "message": "点赞成功" | "取消点赞",
    "likesCount": 10,
    "isLiked": true
  }
  ```

#### 前端实现
- **LikeButton 组件** (`components/LikeButton.tsx`)
  - 显示点赞数量和状态
  - 点击切换点赞/取消点赞
  - 已点赞显示红色填充心形，未点赞显示空心
  - 支持 small/medium 两种尺寸

- **使用示例**:
  ```tsx
  <LikeButton
    initialCount={post.likes?.length || 0}
    initialIsLiked={post.likes?.includes(currentUserId)}
    onToggle={() => api.posts.toggleLike(postId)}
    size="medium"
  />
  ```

---

### 2️⃣ 头像功能

#### 后端实现
- **User 模型** 已有 `avatar` 字段（字符串类型，存储图片 URL）
- 所有返回用户信息的 API 都包含 `avatar` 字段

#### 前端实现
- **Avatar 组件** (`components/Avatar.tsx`)
  - 如果有头像 URL，显示用户上传的头像
  - 如果没有头像，显示用户名首字母+随机背景色
  - 支持 small (32px) / medium (40px) / large (64px) 三种尺寸
  
- **特性**:
  - 自动生成颜色（基于用户名哈希）
  - 圆形头像，统一美观
  - 响应式尺寸

- **使用示例**:
  ```tsx
  <Avatar 
    src={user.avatar} 
    username={user.username} 
    size="medium" 
  />
  ```

- **集成位置**:
  - ✅ 帖子列表页面 - 显示作者头像
  - ✅ 帖子详情页面 - 显示作者和评论者头像
  - ✅ 导航栏 - 显示当前用户头像
  - ✅ 用户资料页面 - 显示和编辑头像

---

### 3️⃣ 用户资料页面

#### 路由
```
/profile - 查看和编辑当前用户资料
```

#### 功能特性
1. **查看模式**:
   - 显示用户头像（大尺寸）
   - 显示用户名、邮箱
   - 显示个人简介
   - 显示注册时间
   - 统计卡片（发帖数、评论数、获赞数 - 待实现）

2. **编辑模式**:
   - 修改用户名（自动检查重复）
   - 设置头像 URL
   - 编辑个人简介（最多 500 字）
   - 实时字数统计

#### API 端点
```
PUT /api/auth/profile
```

**请求体**:
```json
{
  "username": "新用户名",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "这是我的个人简介"
}
```

**响应**:
```json
{
  "success": true,
  "message": "资料更新成功",
  "user": { ... }
}
```

---

### 4️⃣ 导航栏组件

#### 新增 Navbar 组件 (`components/Navbar.tsx`)

**功能**:
- 显示网站 Logo（可点击回到首页）
- 导航链接：首页、发帖
- 用户状态：
  - **未登录**: 显示"登录"和"注册"按钮
  - **已登录**: 显示用户头像和用户名，点击展开下拉菜单
    - 👤 我的资料
    - 🚪 退出登录

**特性**:
- 粘性定位（sticky），滚动时保持在顶部
- 响应式设计
- 平滑动画和悬停效果

---

## 📊 数据库变更

### User 模型
```javascript
{
  username: String,
  email: String,
  password: String,
  avatar: String,           // 原有字段
  bio: String,              // 原有字段
  likedPosts: [ObjectId],   // ✨ 新增：用户点赞的帖子
  likedComments: [ObjectId] // ✨ 新增：用户点赞的评论
}
```

### Post 模型
```javascript
{
  title: String,
  content: String,
  author: ObjectId,
  comments: [ObjectId],
  likes: [ObjectId],  // ✨ 改变：从 Number 改为 ObjectId 数组
  views: Number
}
```

### Comment 模型
```javascript
{
  content: String,
  author: ObjectId,
  post: ObjectId,
  likes: [ObjectId]  // ✨ 改变：从 Number 改为 ObjectId 数组
}
```

---

## 🎨 页面更新

### 帖子列表页 (`/posts`)
- ✅ 显示作者头像
- ✅ 显示点赞按钮和数量
- ✅ 显示评论数量
- ✅ 显示浏览次数
- ✅ 卡片式布局，更加美观

### 帖子详情页 (`/posts/:id`)
- ✅ 显示作者头像和信息
- ✅ 帖子点赞按钮
- ✅ 评论列表显示评论者头像
- ✅ 每条评论都有独立的点赞按钮

### 用户资料页 (`/profile`)
- ✅ 渐变色封面图
- ✅ 大头像展示
- ✅ 资料编辑表单
- ✅ 统计卡片

---

## 🔧 API 客户端更新

新增统一的 API 调用方法 (`lib/apiClient.ts`):

```typescript
import { api } from '@/lib/apiClient';

// 认证
api.auth.register(data)
api.auth.login(data)
api.auth.getCurrentUser()
api.auth.updateProfile(data)  // ✨ 新增

// 帖子
api.posts.getAll()
api.posts.getById(id)
api.posts.create(data)
api.posts.delete(id)
api.posts.toggleLike(id)  // ✨ 新增

// 评论
api.comments.add(postId, content)
api.comments.delete(postId, commentId)
api.comments.toggleLike(postId, commentId)  // ✨ 新增
```

---

## 🚀 如何使用

### 设置头像
1. 登录后点击导航栏的用户名
2. 选择"我的资料"
3. 在"头像 URL"输入框中输入图片链接
4. 点击"保存修改"

**推荐头像服务**:
- [Gravatar](https://gravatar.com/)
- [UI Avatars](https://ui-avatars.com/)
- [Lorem Picsum](https://picsum.photos/)

**示例 URL**:
```
https://ui-avatars.com/api/?name=张三&background=random
https://picsum.photos/200
```

### 点赞帖子/评论
1. 找到想要点赞的内容
2. 点击❤️图标
3. 再次点击取消点赞

### 编辑资料
1. 访问 `/profile` 或点击导航栏"我的资料"
2. 点击"编辑资料"按钮
3. 修改用户名、头像、简介
4. 点击"保存修改"

---

## 🐛 已知限制

1. **头像上传**: 暂时只支持 URL 链接，后续会添加文件上传功能
2. **统计数据**: 用户资料页的发帖数、评论数、获赞数暂时显示为 0，需要额外的统计 API
3. **头像缓存**: 头像 URL 更新后可能需要刷新页面才能看到变化

---

## 📝 后续计划

- [ ] 添加图片上传功能（使用云存储服务）
- [ ] 实现用户统计数据（发帖数、评论数、获赞数）
- [ ] 添加"查看其他用户资料"功能
- [ ] 实现"我赞过的帖子"页面
- [ ] 添加关注/粉丝功能
- [ ] 点赞动画效果优化

---

**版本**: v0.2.0  
**更新日期**: 2025-12-03  
**作者**: GitHub Copilot AI 助手
