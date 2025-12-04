"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import { api } from '@/lib/apiClient';

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
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

                // 获取帖子列表
                const response = await api.posts.getAll();
                if (response.data.success) {
                    setPosts(response.data.posts || []);
                } else {
                    setError(response.data.message || '获取帖子失败');
                }
            } catch (err) {
                setError('网络错误，无法获取帖子');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    if (loading) return <main style={{ padding: '2rem' }}>加载中...</main>;
    if (error) return <main style={{ padding: '2rem', color: '#c00' }}>{error}</main>;

    return (
        <main style={{ padding: '2rem', background: '#f7f8fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 900, margin: '0 auto 2rem auto' }}>
                <h1 style={{ fontWeight: 700, fontSize: '2rem' }}>社区帖子</h1>
                <Link href="/posts/create">
                    <button style={{ padding: '0.6rem 1.2rem', background: '#0ea5ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, boxShadow: '0 2px 8px #0ea5ff22' }}>发布帖子</button>
                </Link>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '3rem' }}>还没有帖子，快来发布第一个吧。</div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {posts.map((p) => (
                            <div key={p._id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem' }}>
                                {/* 作者信息 */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <Avatar src={p.author?.avatar} username={p.author?.username || '匿名'} size="medium" />
                                    <div style={{ marginLeft: '0.75rem' }}>
                                        <div style={{ fontWeight: 600, color: '#222' }}>{p.author?.username || '匿名'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(p.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* 帖子标题（可点击） */}
                                <Link href={`/posts/${p._id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#222', marginBottom: '0.5rem', cursor: 'pointer' }}>{p.title}</div>
                                    <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                                        {p.content.substring(0, 150)}{p.content.length > 150 ? '...' : ''}
                                    </div>

                                    {/* 帖子缩略图 */}
                                    {p.images && p.images.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                            {p.images.slice(0, 3).map((img: string, idx: number) => (
                                                <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 6 }} />
                                            ))}
                                            {p.images.length > 3 && (
                                                <div style={{ width: '100%', height: '150px', background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 600 }}>
                                                    +{p.images.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Link>

                                {/* 互动按钮 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                                    <LikeButton
                                        initialCount={p.likes?.length || 0}
                                        initialIsLiked={currentUserId ? p.likes?.includes(currentUserId) : false}
                                        onToggle={() => handleLikePost(p._id)}
                                        size="medium"
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.95rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>{p.comments?.length || 0} 评论</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.95rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>{p.views || 0} 浏览</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
