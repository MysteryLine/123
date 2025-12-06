'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/apiClient';
import LoadingLink from './LoadingLink';

interface Notification {
    _id: string;
    type: 'comment' | 'like' | 'follow' | 'post_like' | 'comment_like';
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    post?: {
        _id: string;
        title: string;
    };
    comment?: {
        _id: string;
        content: string;
    };
    isRead: boolean;
    createdAt: string;
}

interface NotificationData {
    notifications: Notification[];
    unreadCount: number;
    total: number;
}

export default function NotificationBell() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 获取未读数量
    const fetchUnreadCount = async () => {
        try {
            const response = await api.notifications.getUnreadCount();
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('获取未读数量失败:', error);
        }
    };

    // 获取通知列表
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.notifications.getAll(20, 0);
            const data: NotificationData = response.data;
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('获取通知列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 标记为已读
    const markAsRead = async (notificationId: string) => {
        try {
            await api.notifications.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('标记已读失败:', error);
        }
    };

    // 标记全部为已读
    const markAllAsRead = async () => {
        try {
            await api.notifications.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('标记全部已读失败:', error);
        }
    };

    // 删除通知
    const deleteNotification = async (notificationId: string) => {
        try {
            await api.notifications.delete(notificationId);
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
            fetchUnreadCount();
        } catch (error) {
            console.error('删除通知失败:', error);
        }
    };

    // 格式化通知内容
    const formatNotification = (notification: Notification) => {
        const { type, sender, post, comment } = notification;

        switch (type) {
            case 'comment':
                return (
                    <>
                        <strong>{sender.username}</strong> 评论了你的帖子
                        {post && `: "${post.title.slice(0, 20)}${post.title.length > 20 ? '...' : ''}"`}
                    </>
                );
            case 'post_like':
                return (
                    <>
                        <strong>{sender.username}</strong> 赞了你的帖子
                        {post && `: "${post.title.slice(0, 20)}${post.title.length > 20 ? '...' : ''}"`}
                    </>
                );
            case 'comment_like':
                return (
                    <>
                        <strong>{sender.username}</strong> 赞了你的评论
                        {comment && `: "${comment.content.slice(0, 20)}${comment.content.length > 20 ? '...' : ''}"`}
                    </>
                );
            case 'follow':
                return (
                    <>
                        <strong>{sender.username}</strong> 关注了你
                    </>
                );
            default:
                return '新通知';
        }
    };

    // 获取通知链接
    const getNotificationLink = (notification: Notification) => {
        if (notification.post) {
            return `/posts/${notification.post._id}`;
        }
        if (notification.type === 'follow') {
            return `/profile?userId=${notification.sender._id}`;
        }
        return '#';
    };

    // 格式化时间
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return date.toLocaleDateString('zh-CN');
    };

    // 初始化加载未读数量
    useEffect(() => {
        fetchUnreadCount();

        // 定期刷新未读数量
        const interval = setInterval(fetchUnreadCount, 30000); // 每30秒
        return () => clearInterval(interval);
    }, []);

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    // 打开下拉框时加载通知
    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            fetchNotifications();
        }
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            {/* 通知铃铛按钮 */}
            <button onClick={handleBellClick} style={styles.bellButton}>
                <span style={styles.bellIcon}>🔔</span>
                {unreadCount > 0 && (
                    <span style={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 下拉通知列表 */}
            {showDropdown && (
                <div style={styles.dropdown}>
                    {/* 头部 */}
                    <div style={styles.header}>
                        <h3 style={styles.title}>通知</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} style={styles.markAllButton}>
                                全部已读
                            </button>
                        )}
                    </div>

                    {/* 通知列表 */}
                    <div style={styles.notificationList}>
                        {loading ? (
                            <div style={styles.loading}>加载中...</div>
                        ) : notifications.length === 0 ? (
                            <div style={styles.empty}>
                                <span style={styles.emptyIcon}>📭</span>
                                <p>暂无通知</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    style={{
                                        ...styles.notificationItem,
                                        ...(notification.isRead ? {} : styles.unreadItem),
                                    }}
                                >
                                    <LoadingLink
                                        href={getNotificationLink(notification)}
                                        style={styles.notificationLink}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                markAsRead(notification._id);
                                            }
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <div style={styles.notificationContent}>
                                            <p style={styles.notificationText}>
                                                {formatNotification(notification)}
                                            </p>
                                            <span style={styles.notificationTime}>
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                    </LoadingLink>
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        style={styles.deleteButton}
                                        title="删除"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'relative',
    },
    bellButton: {
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
    },
    bellIcon: {
        display: 'block',
    },
    badge: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: '#ff4444',
        color: 'white',
        borderRadius: '10px',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: 'bold',
        minWidth: '18px',
        textAlign: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: '0',
        width: '380px',
        maxHeight: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
    },
    markAllButton: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    notificationList: {
        maxHeight: '420px',
        overflowY: 'auto',
    },
    notificationItem: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 20px',
        borderBottom: '1px solid #f3f4f6',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
    },
    unreadItem: {
        backgroundColor: '#eff6ff',
    },
    notificationLink: {
        flex: 1,
        textDecoration: 'none',
        color: 'inherit',
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.5',
    },
    notificationTime: {
        fontSize: '12px',
        color: '#9ca3af',
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        color: '#9ca3af',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '0 4px',
        marginLeft: '8px',
        transition: 'color 0.2s',
    },
    loading: {
        padding: '40px 20px',
        textAlign: 'center',
        color: '#9ca3af',
    },
    empty: {
        padding: '40px 20px',
        textAlign: 'center',
        color: '#9ca3af',
    },
    emptyIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '12px',
    },
};
