# 图片上传功能测试指南

## 功能概述
已为论坛添加图片上传功能，用户可以在发帖和评论时上传图片。

## 技术实现
- **云存储**: 七牛云（新加坡节点）
- **域名**: http://t6qsnqnup.sabkt.gdipper.com
- **上传限制**: 
  - 帖子最多 9 张图片
  - 评论最多 6 张图片
  - 单张图片最大 5MB
  - 支持所有常见图片格式

## 测试步骤

### 1. 启动后端服务器
```bash
cd backend
npm install  # 确保安装了 qiniu 包
npm run dev
```
后端应该运行在 http://localhost:5000

### 2. 启动前端服务器
```bash
cd frontend
npm install
npm run dev
```
前端应该运行在 http://localhost:3000

### 3. 测试发帖上传图片
1. 登录账号
2. 点击"发布帖子"
3. 填写标题和内容
4. 点击"📷 选择图片"按钮
5. 选择 1-9 张图片
6. 等待上传完成（会显示预览）
7. 点击"发布"

### 4. 测试评论上传图片
1. 进入任意帖子详情页
2. 在评论框填写评论内容
3. 在"添加图片（可选）"区域点击"📷 选择图片"
4. 选择 1-6 张图片
5. 等待上传完成
6. 点击"发表评论"

### 5. 验证图片显示
- 帖子列表：显示前 3 张缩略图（150x150px）
- 帖子详情：显示所有图片（200x200px网格布局）
- 评论区：显示所有图片（120x120px网格布局）
- 点击图片可在新标签页打开原图

## API 端点

### 获取上传凭证
```
GET /api/upload/token
Headers: Authorization: Bearer <jwt_token>
Response: {
  success: true,
  token: "七牛云上传凭证",
  domain: "CDN域名"
}
```

## 数据模型变更

### Post 模型
```javascript
{
  title: String,
  content: String,
  images: [String],  // 新增：图片URL数组
  author: ObjectId,
  likes: [ObjectId],
  views: Number,
  comments: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Comment 模型
```javascript
{
  content: String,
  images: [String],  // 新增：图片URL数组
  author: ObjectId,
  post: ObjectId,
  likes: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 注意事项
1. 图片上传需要用户登录
2. 图片会先上传到七牛云，成功后URL才会保存到数据库
3. 删除帖子/评论不会自动删除七牛云上的图片（需要手动清理）
4. 建议在生产环境配置 CDN 加速域名

## 故障排查
- 如果上传失败，检查七牛云配置（access key、secret key、bucket名称）
- 如果图片不显示，检查域名是否正确配置
- 如果提示未登录，清除浏览器 localStorage 后重新登录
