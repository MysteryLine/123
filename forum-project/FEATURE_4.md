# 功能 4：评论区趣味互动

## 功能说明

为帖子和评论添加"点赞&踩"双按钮系统，支持趣味提示词和文字飘出动效。

### 核心特性
- 👍 **点赞按钮**：显示绿色，点击时出现随机点赞提示词
- 👎 **踩按钮**：显示红色，点击时出现搞笑安慰提示词
- ✨ **动效**：提示词从按钮中心向上飘出 2 秒后渐隐消失
- 🔄 **互斥选择**：点赞和踩互相排斥，只能选一个

### 提示词库

**点赞（绿色 💚）**
```
太棒了！👍 | 我喜欢！❤️ | 你真幽默！😂
深表赞同！💯 | 绝妙的想法！✨ | 让我点个赞！🌟
```

**踩（红色 ❤️‍🔥，搞笑安慰）**
```
别踩啦，作者会哭的😭 | 手下留情～🥺 | 都是误会呀～
给我一次改过的机会吧！😢 | 我会改进的，相信我！💪
请不要伤害我QAQ | 其实我很努力的… | 有什么问题请指正👉
```

## 技术实现

### 新建文件
- `frontend/components/InteractionButton.tsx` - 互动按钮组件

### 修改文件
- `frontend/app/posts/[id]/page.tsx` - 集成 InteractionButton 组件

### 尺寸规格
| 尺寸 | 高度 | 字体 | 使用位置 |
|------|------|------|---------|
| small | 28px | 0.8rem | 评论互动 |
| medium | 36px | 0.95rem | 帖子互动 |
| large | 44px | 1.1rem | 预留 |

### 动效设计
```css
@keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-60px) scale(0.9); opacity: 0; }
}
持续时间：2秒 | 缓动函数：ease-out
```

## 使用位置

### 帖子详情页 `/posts/[id]`

**帖子互动（medium 尺寸）**
```tsx
<InteractionButton
    initialLikeCount={post.likes?.length || 0}
    initialUserLiked={currentUserId ? post.likes?.includes(currentUserId) : false}
    onLike={handleLikePost}
    size="medium"
/>
```

**评论互动（small 尺寸）**
```tsx
<InteractionButton
    initialLikeCount={c.likes?.length || 0}
    initialUserLiked={currentUserId ? c.likes?.includes(currentUserId) : false}
    onLike={() => handleLikeComment(c._id)}
    size="small"
/>
```

## 视觉设计

| 状态 | 背景 | 边框 | 文字 |
|------|------|------|------|
| 未交互 | 白色 #fff | 浅灰 #e5e7eb | 灰色 #666 |
| 已点赞 | 浅绿 #dcfce7 | 绿色 #16a34a (2px) | 绿色 #16a34a (加粗) |
| 已踩 | 浅红 #fee2e2 | 红色 #dc2626 (2px) | 红色 #dc2626 (加粗) |

## 测试要点

- [ ] 点赞功能正常，显示绿色提示词
- [ ] 踩功能正常，显示红色提示词
- [ ] 提示词随机出现
- [ ] 2 秒后提示词消失
- [ ] 点赞和踩互斥切换
- [ ] 页面刷新后状态保持
- [ ] 未登录时提示"请先登录"

---

**完成时间**：2025-12-05 | **状态**：✅ 完成
