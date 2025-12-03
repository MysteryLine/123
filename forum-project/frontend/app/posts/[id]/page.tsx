"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PostDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const base = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;

    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`${base}/api/posts/${id}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.post);
                    setComments(data.post.comments || []);
                } else {
                    setError(data.message || '获取帖子失败');
                }
            } catch (err) {
                setError('网络错误，无法加载帖子');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, base]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${base}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ content: commentContent }),
            });
            const data = await res.json();
            if (data.success) {
                setComments([...comments, data.comment]);
                setCommentContent('');
            } else {
                alert(data.message || '评论失败');
            }
        } catch (err) {
            alert('网络错误，发表评论失败');
        } finally {
            setSubmitting(false);
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
                    <h1 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>{post.title}</h1>
                    <div style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        作者：<span style={{ fontWeight: 600 }}>{post.author?.username || '匿名'}</span> · {new Date(post.createdAt).toLocaleString()}
                    </div>
                    <article style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#222', whiteSpace: 'pre-wrap' }}>{post.content}</article>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600, color: '#222' }}>{c.author?.username || '匿名'}</span>
                                    <span style={{ color: '#999', fontSize: '0.9rem' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.content}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
