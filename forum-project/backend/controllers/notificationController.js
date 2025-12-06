import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// 创建通知
export const createNotification = async (recipientId, senderId, type, postId = null, commentId = null) => {
    try {
        // 不给自己发通知
        if (recipientId.toString() === senderId.toString()) {
            return null;
        }

        // 检查是否已存在相同通知（避免重复）
        const existingNotification = await Notification.findOne({
            recipient: recipientId,
            sender: senderId,
            type: type,
            post: postId,
            comment: commentId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小时内
        });

        if (existingNotification) {
            return existingNotification;
        }

        const notification = await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: type,
            post: postId,
            comment: commentId,
        });

        return notification;
    } catch (error) {
        console.error('创建通知失败:', error);
        return null;
    }
};

// 获取用户的所有通知
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 20, skip = 0 } = req.query;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username avatar')
            .populate('post', 'title')
            .populate('comment', 'content')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error('获取通知失败:', error);
        res.status(500).json({
            success: false,
            message: '获取通知失败',
            error: error.message,
        });
    }
};

// 标记通知为已读
export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        if (notificationId === 'all') {
            // 标记所有通知为已读
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            );
            return res.json({
                success: true,
                message: '所有通知已标记为已读',
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: '通知不存在',
            });
        }

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error('标记通知失败:', error);
        res.status(500).json({
            success: false,
            message: '标记通知失败',
            error: error.message,
        });
    }
};

// 删除通知
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: '通知不存在',
            });
        }

        res.json({
            success: true,
            message: '通知已删除',
        });
    } catch (error) {
        console.error('删除通知失败:', error);
        res.status(500).json({
            success: false,
            message: '删除通知失败',
            error: error.message,
        });
    }
};

// 获取未读通知数量
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        const count = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('获取未读通知数量失败:', error);
        res.status(500).json({
            success: false,
            message: '获取未读通知数量失败',
            error: error.message,
        });
    }
};
