"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import { api } from '@/lib/apiClient';

export default function PostDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
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

                // 获取帖子详情
                const response = await api.posts.getById(id);
                if (response.data.success) {
                    setPost(response.data.post);
                    setComments(response.data.post.comments || []);
                } else {
                    setError(response.data.message || '获取帖子失败');
                }
            } catch (err) {
                setError('网络错误，无法加载帖子');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setSubmitting(true);
        try {
            const response = await api.comments.add(id, commentContent);
            if (response.data.success) {
                setComments([...comments, response.data.comment]);
                setCommentContent('');
            } else {
                alert(response.data.message || '评论失败');
            }
        } catch (err) {
            alert('网络错误，发表评论失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikePost = async () => {
        if (!currentUserId) {
            alert('请先登录');
            return;
        }
        try {
            const response = await api.posts.toggleLike(id);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!currentUserId) {
            alert('请先登录');
            return;
        }
        try {
            const response = await api.comments.toggleLike(id, commentId);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    if (loading) return <main style={{ padding: '2rem' }}>加载中...</main>;
    if (error) return <main style={{ padding: '2rem', color: '#c00' }}>{error}</main>;
    if (!post) return <main style={{ padding: '2rem' }}>帖子不存在</main>;

    return (
        <main style={{ padding: '2rem', background: '#f7f8fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {/* 帖子内容 */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '2rem', marginBottom: '2rem' }}>
                    {/* 作者信息 */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <Avatar src={post.author?.avatar} username={post.author?.username || '匿名'} size="medium" />
                        <div style={{ marginLeft: '0.75rem', flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#222', fontSize: '1.05rem' }}>{post.author?.username || '匿名'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#666', fontSize: '0.9rem' }}>
                            <span>👁️ {post.views || 0} 浏览</span>
                        </div>
                    </div>

                    {/* 标题和内容 */}
                    <h1 style={{ fontWeight: 700, fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111' }}>{post.title}</h1>
                    <article style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#222', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{post.content}</article>

                    {/* 互动按钮 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                        <LikeButton
                            initialCount={post.likes?.length || 0}
                            initialIsLiked={currentUserId ? post.likes?.includes(currentUserId) : false}
                            onToggle={handleLikePost}
                            size="medium"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.95rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{comments.length} 评论</span>
                        </div>
                    </div>
                </div>

                {/* 评论区标题 */}
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>评论区 ({comments.length})</h2>

                {/* 发表评论表单 */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem', marginBottom: '2rem' }}>
                    <form onSubmit={handleAddComment}>
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="分享你的想法..."
                            rows={4}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid #e6e6e6', fontSize: '1rem', boxSizing: 'border-box' }}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !commentContent.trim()}
                            style={{ marginTop: '0.75rem', padding: '0.6rem 1.2rem', background: '#0ea5ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                            {submitting ? '发表中...' : '发表评论'}
                        </button>
                    </form>
                </div>

                {/* 评论列表 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#888' }}>暂无评论，来发表第一条吧~</div>
                    ) : (
                        comments.map((c) => (
                            <div key={c._id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem' }}>
                                {/* 评论者信息 */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <Avatar src={c.author?.avatar} username={c.author?.username || '匿名'} size="small" />
                                    <div style={{ marginLeft: '0.5rem', flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#222', fontSize: '0.95rem' }}>{c.author?.username || '匿名'}</div>
                                        <div style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* 评论内容 */}
                                <div style={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '0.75rem', marginLeft: '2.5rem' }}>{c.content}</div>

                                {/* 评论点赞 */}
                                <div style={{ marginLeft: '2.5rem' }}>
                                    <LikeButton
                                        initialCount={c.likes?.length || 0}
                                        initialIsLiked={currentUserId ? c.likes?.includes(currentUserId) : false}
                                        onToggle={() => handleLikeComment(c._id)}
                                        size="small"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
