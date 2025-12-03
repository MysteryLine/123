import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));

// 数据库连接
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

connectDB();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// Socket.io 连接处理（聊天功能）
io.on('connection', (socket) => {
  console.log('✅ 新用户已连接:', socket.id);

  // 加入聊天室
  socket.on('join_room', (data) => {
    socket.join(data.room);
    io.to(data.room).emit('receive_message', {
      message: `${data.username} 加入了聊天室`,
      username: '系统',
    });
  });

  // 接收并转发消息
  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在端口 ${PORT}`);
  console.log(`📍 API 基础 URL: http://localhost:${PORT}/api`);
});
