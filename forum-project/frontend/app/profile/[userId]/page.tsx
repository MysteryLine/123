'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import { api } from '@/lib/apiClient';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    followers: any[];
    following: any[];
    followersCount: number;
    followingCount: number;
    createdAt: string;
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.userId as string;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                // 获取当前用户信息
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userResponse = await api.auth.getCurrentUser();
                        setCurrentUserId(userResponse.data.user.id);
                    } catch (err) {
                        console.log('未登录或token过期');
                    }
                }

                // 获取用户信息
                const userRes = await api.auth.getUserProfile(userId);
                if (userRes.data.success) {
                    setUser(userRes.data.user);
                    // 检查是否已关注
                    if (currentUserId && userRes.data.user.followers) {
                        setIsFollowing(userRes.data.user.followers.some((f: any) => f._id === currentUserId));
                    }
                }

                // 获取用户的帖子
                const postsRes = await api.posts.getUserPosts(userId, currentPage, pageSize);
                if (postsRes.data.success) {
                    setPosts(postsRes.data.posts || []);
                    setTotalPages(postsRes.data.pagination.totalPages);
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, currentPage, currentUserId]);

    const handleFollowClick = async () => {
        if (!currentUserId) {
            alert('请先登录');
            return;
        }

        try {
            if (isFollowing) {
                await api.auth.unfollowUser(userId);
                setIsFollowing(false);
            } else {
                await api.auth.followUser(userId);
                setIsFollowing(true);
            }
            // 刷新用户信息
            const userRes = await api.auth.getUserProfile(userId);
            if (userRes.data.success) {
                setUser(userRes.data.user);
            }
        } catch (error) {
            alert('操作失败，请重试');
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!currentUserId) {
            alert('请先登录');
            return;
        }

        try {
            const response = await api.posts.toggleLike(postId);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    if (isLoading) {
        return <main style={{ padding: '2rem' }}>加载中...</main>;
    }

    if (!user) {
        return <main style={{ padding: '2rem', color: '#c00' }}>用户不存在</main>;
    }

    const isOwnProfile = currentUserId === user.id;

    return (
        <main style={{ padding: '2rem', background: '#f7f8fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* 用户信息卡片 */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '2rem', marginBottom: '2rem' }}>
                    {/* 用户头像和基本信息 */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Avatar
                                src={user.avatar}
                                username={user.username}
                                size="large"
                                className="border-4 border-white shadow-2xl"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111' }}>{user.username}</h1>
                                <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '9999px', border: '1px solid #c7d2fe', fontWeight: '500' }}>用户</span>
                            </div>
                            <p style={{ color: '#666', margin: '0.25rem 0 0 0' }}>{user.email}</p>
                        </div>

                        {/* 关注按钮或编辑按钮 */}
                        {isOwnProfile ? (
                            <Link href="/profile">
                                <button style={{ padding: '0.6rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    ✏️ 编辑资料
                                </button>
                            </Link>
                        ) : (
                            <button
                                onClick={handleFollowClick}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: isFollowing ? '#e0e7ff' : '#4f46e5',
                                    color: isFollowing ? '#4338ca' : '#fff',
                                    border: isFollowing ? '1px solid #c7d2fe' : 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                }}
                            >
                                {isFollowing ? '✓ 已关注' : '➕ 关注'}
                            </button>
                        )}
                    </div>

                    {/* 用户统计 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                        <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>{posts.length}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>帖子</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>{user.followersCount}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>粉丝</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>{user.followingCount}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>关注</div>
                        </div>
                    </div>

                    {/* 简介部分 */}
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>个人简介</h2>
                        <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {user.bio || '这个人很懒，还没有写简介...'}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>加入时间</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#111' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>邮箱</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#111', wordBreak: 'break-all' }}>{user.email}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 用户的帖子列表 */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>{user.username} 的帖子</h2>

                    {posts.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#888' }}>
                            暂无帖子
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {posts.map((post) => (
                                <div key={post._id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem' }}>
                                    <Link href={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#222', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                            {post.title}
                                        </h3>
                                        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                                            {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                                        </p>

                                        {post.images && post.images.length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {post.images.slice(0, 3).map((img: string, idx: number) => (
                                                    <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 6 }} />
                                                ))}
                                                {post.images.length > 3 && (
                                                    <div style={{ width: '100%', height: '120px', background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 600 }}>
                                                        +{post.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Link>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                                        <LikeButton
                                            initialCount={post.likes?.length || 0}
                                            initialIsLiked={currentUserId ? post.likes?.includes(currentUserId) : false}
                                            onToggle={() => handleLikePost(post._id)}
                                            size="small"
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
                                            <span>💬 {post.comments?.length || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
                                            <span>👁️ {post.views || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 分页控件 */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}
                            >
                                上一页
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = Math.max(1, currentPage - 2) + i;
                                return page <= totalPages ? page : null;
                            }).filter(Boolean).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        background: currentPage === page ? '#0ea5ff' : '#fff',
                                        color: currentPage === page ? '#fff' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: currentPage === page ? '600' : '400',
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                }}
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
