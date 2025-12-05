'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { api } from '@/lib/apiClient';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
    followersCount?: number;
    followingCount?: number;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    images?: string[];
    createdAt: string;
    likes?: string[];
    comments?: string[];
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        avatar: '',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await api.auth.getCurrentUser();
            const userData = response.data.user;
            setUser(userData);
            setFormData({
                username: userData.username,
                bio: userData.bio || '',
                avatar: userData.avatar || '',
            });

            // 获取所有帖子，然后筛选该用户的帖子
            const postsResponse = await api.posts.getAll();
            const allPosts = postsResponse.data.posts || [];
            const myPosts = allPosts.filter((post: any) => post.author?.id === userData.id || post.author?._id === userData.id);
            setUserPosts(myPosts);
        } catch (error) {
            console.error('获取用户信息失败:', error);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await api.auth.updateProfile(formData);
            setUser(response.data.user);
            setIsEditing(false);
            alert('资料更新成功！');
        } catch (error: any) {
            console.error('更新失败:', error);
            alert(error.response?.data?.message || '更新失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            bio: user?.bio || '',
            avatar: user?.avatar || '',
        });
        setIsEditing(false);
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('确定要删除这篇帖子吗？')) return;

        setDeletingId(postId);
        try {
            await api.posts.delete(postId);
            setUserPosts(userPosts.filter(post => post._id !== postId));
            alert('帖子已删除');
        } catch (error: any) {
            console.error('删除失败:', error);
            alert(error.response?.data?.message || '删除失败，请重试');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">加载中...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #fef3c7, #fce7f3)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* 头部卡片 */}
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'visible', marginBottom: '2rem' }}>
                    {/* 封面图 */}
                    <div style={{ height: '180px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', borderRadius: '20px 20px 0 0' }}></div>

                    {/* 用户信息部分 */}
                    <div style={{ padding: '80px 2rem 2rem 2rem', textAlign: 'center', background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05))', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)' }}>
                            <Avatar
                                src={user.avatar}
                                username={user.username}
                                size="large"
                                className="border-4 border-white shadow-2xl"
                                editable={!isEditing}
                                onEdit={() => router.push('/profile/avatar')}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111' }}>{user.username}</h1>
                                <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '9999px', border: '1px solid #c7d2fe', fontWeight: '500' }}>会员</span>
                            </div>
                            <p style={{ color: '#666', margin: '0.25rem 0 0 0' }}>{user.email}</p>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{ padding: '0.6rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                ✏️ 编辑资料
                            </button>
                        )}
                    </div>

                    {/* 简介部分 */}
                    {!isEditing && (
                        <div style={{ borderTop: '1px solid #e5e7eb', padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>个人简介</h2>
                            <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {user.bio || '这个人很懒，还没有写简介...'}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                                <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>加入时间</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#111' }}>{formatDate(user.createdAt)}</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>邮箱</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#111' }}>{user.email}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 编辑表单 */}
                    {isEditing && (
                        <form onSubmit={handleSubmit} style={{ padding: '2rem', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                                    用户名
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                    required
                                    minLength={3}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                                    头像 URL（可选）
                                </label>
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>暂时请使用图片链接</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                                    个人简介
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={5}
                                    placeholder="介绍一下自己吧..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }}
                                    maxLength={500}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{formData.bio.length}/500</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{ padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                                >
                                    {isSaving ? '保存中...' : '💾 保存修改'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    style={{ padding: '0.75rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* 统计信息 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '0.5rem' }}>{userPosts.length}</div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>发帖数</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>{userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}</div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>评论数</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ec4899', marginBottom: '0.5rem' }}>{userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)}</div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>获赞数</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>{user?.followersCount || 0}</div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>粉丝</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#06b6d4', marginBottom: '0.5rem' }}>{user?.followingCount || 0}</div>
                        <div style={{ fontSize: '0.95rem', color: '#666' }}>关注</div>
                    </div>
                </div>

                {/* 我的帖子部分 */}
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#111' }}>📝 我的帖子</h2>
                        <Link href="/posts/create" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                                ✍️ 发布新帖
                            </button>
                        </Link>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {userPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>还没有发布任何帖子</p>
                                <p style={{ fontSize: '0.95rem', color: '#aaa' }}>分享你的想法和经验吧！</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {userPosts.map((post) => (
                                    <div key={post._id} style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', transition: 'all 0.3s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <Link href={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111', margin: '0 0 0.5rem 0', cursor: 'pointer' }}>
                                                        {post.title}
                                                    </h3>
                                                </Link>
                                                <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>
                                                    {formatDate(post.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePost(post._id)}
                                                disabled={deletingId === post._id}
                                                style={{ marginLeft: '1rem', padding: '0.5rem 0.8rem', fontSize: '0.9rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: deletingId === post._id ? 'not-allowed' : 'pointer', opacity: deletingId === post._id ? 0.6 : 1 }}
                                            >
                                                {deletingId === post._id ? '删除中...' : '🗑️ 删除'}
                                            </button>
                                        </div>

                                        <p style={{ color: '#555', lineHeight: '1.6', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.content}
                                        </p>

                                        {/* 图片预览 */}
                                        {post.images && post.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.5rem', overflow: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                                                {post.images.slice(0, 4).map((img, idx) => (
                                                    <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                                                ))}
                                                {post.images.length > 4 && (
                                                    <div style={{ height: '80px', width: '80px', background: '#ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#666', flexShrink: 0 }}>
                                                        +{post.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 统计信息 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#666' }}>
                                            <span>👍 {post.likes?.length || 0} 赞</span>
                                            <span>💬 {post.comments?.length || 0} 评论</span>
                                            <Link href={`/posts/${post._id}`} style={{ marginLeft: 'auto', color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}>
                                                查看详情 →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
