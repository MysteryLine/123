import express from 'express';
import {
    getNotifications,
    markAsRead,
    deleteNotification,
    getUnreadCount,
} from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 获取所有通知
router.get('/', auth, getNotifications);

// 获取未读通知数量
router.get('/unread-count', auth, getUnreadCount);

// 标记通知为已读
router.put('/:notificationId/read', auth, markAsRead);

// 删除通知
router.delete('/:notificationId', auth, deleteNotification);

export default router;
