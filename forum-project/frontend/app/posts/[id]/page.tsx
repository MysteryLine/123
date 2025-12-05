"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import InteractionButton from '@/components/InteractionButton';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/lib/apiClient';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [commentImages, setCommentImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // 帖子编辑状态
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostData, setEditPostData] = useState({ title: '', content: '', images: [] as string[] });
    const [isEditingPostSubmitting, setIsEditingPostSubmitting] = useState(false);

    // 评论编辑状态
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentData, setEditCommentData] = useState({ content: '', images: [] as string[] });
    const [isEditingCommentSubmitting, setIsEditingCommentSubmitting] = useState(false);

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
            const response = await api.comments.add(id, commentContent, commentImages);
            if (response.data.success) {
                setComments([...comments, response.data.comment]);
                setCommentContent('');
                setCommentImages([]);
            } else {
                alert(response.data.message || '评论失败');
            }
        } catch (err) {
            alert('网络错误，发表评论失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditPost = async () => {
        if (!editPostData.title.trim() || !editPostData.content.trim()) {
            alert('标题和内容不能为空');
            return;
        }

        setIsEditingPostSubmitting(true);
        try {
            const response = await api.posts.update(id, {
                title: editPostData.title,
                content: editPostData.content,
                images: editPostData.images
            });
            if (response.data.success) {
                setPost(response.data.post);
                setIsEditingPost(false);
                alert('帖子已更新');
            } else {
                alert(response.data.message || '更新失败');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || '更新失败');
        } finally {
            setIsEditingPostSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('确定要删除这篇帖子吗？')) return;

        try {
            await api.posts.delete(id);
            alert('帖子已删除');
            router.push('/posts');
        } catch (err: any) {
            alert(err.response?.data?.message || '删除失败');
        }
    };

    const handleEditComment = (comment: any) => {
        setEditingCommentId(comment._id);
        setEditCommentData({
            content: comment.content,
            images: comment.images || []
        });
    };

    const handleSaveCommentEdit = async (commentId: string) => {
        if (!editCommentData.content.trim()) {
            alert('评论内容不能为空');
            return;
        }

        setIsEditingCommentSubmitting(true);
        try {
            const response = await api.comments.update(id, commentId, editCommentData.content, editCommentData.images);
            if (response.data.success) {
                setComments(comments.map(c => c._id === commentId ? response.data.comment : c));
                setEditingCommentId(null);
                setEditCommentData({ content: '', images: [] });
            } else {
                alert(response.data.message || '更新失败');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || '更新失败');
        } finally {
            setIsEditingCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('确定要删除这条评论吗？')) return;

        try {
            await api.comments.delete(id, commentId);
            setComments(comments.filter(c => c._id !== commentId));
            alert('评论已删除');
        } catch (err: any) {
            alert(err.response?.data?.message || '删除失败');
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

    const isPostAuthor = currentUserId === post.author?._id || currentUserId === post.author?.id;

    return (
        <main style={{ padding: '2rem', background: '#f7f8fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {/* 帖子内容 */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '2rem', marginBottom: '2rem' }}>
                    {/* 作者信息和操作按钮 */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <Avatar src={post.author?.avatar} username={post.author?.username || '匿名'} size="medium" />
                        <div style={{ marginLeft: '0.75rem', flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#222', fontSize: '1.05rem' }}>{post.author?.username || '匿名'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                            <span>👁️ {post.views || 0} 浏览</span>
                            {isPostAuthor && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditingPost(!isEditingPost);
                                            if (!isEditingPost) {
                                                setEditPostData({
                                                    title: post.title,
                                                    content: post.content,
                                                    images: post.images || []
                                                });
                                            }
                                        }}
                                        style={{ padding: '0.3rem 0.6rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        ✏️ 编辑
                                    </button>
                                    <button
                                        onClick={handleDeletePost}
                                        style={{ padding: '0.3rem 0.6rem', background: '#f87171', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        🗑️ 删除
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {!isEditingPost ? (
                        <>
                            {/* 标题和内容 */}
                            <h1 style={{ fontWeight: 700, fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111' }}>{post.title}</h1>
                            <article style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#222', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{post.content}</article>

                            {/* 帖子图片 */}
                            {post.images && post.images.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    {post.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* 编辑表单 */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>标题</label>
                                <input
                                    type="text"
                                    value={editPostData.title}
                                    onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem' }}
                                />

                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>内容</label>
                                <textarea
                                    value={editPostData.content}
                                    onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                                    rows={8}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'inherit' }}
                                />

                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>图片</label>
                                <ImageUpload onImagesChange={(imgs) => setEditPostData({ ...editPostData, images: imgs })} maxImages={9} existingImages={editPostData.images} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={handleEditPost}
                                    disabled={isEditingPostSubmitting}
                                    style={{ padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isEditingPostSubmitting ? 'not-allowed' : 'pointer', opacity: isEditingPostSubmitting ? 0.6 : 1 }}
                                >
                                    {isEditingPostSubmitting ? '保存中...' : '💾 保存'}
                                </button>
                                <button
                                    onClick={() => setIsEditingPost(false)}
                                    style={{ padding: '0.75rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    取消
                                </button>
                            </div>
                        </>
                    )}

                    {/* 互动按钮 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0', marginTop: '1.5rem' }}>
                        <InteractionButton
                            initialLikeCount={post.likes?.length || 0}
                            initialUserLiked={currentUserId ? post.likes?.includes(currentUserId) : false}
                            onLike={handleLikePost}
                            size="medium"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.95rem' }}>
                            <span>💬 {comments.length} 评论</span>
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
                            style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid #e6e6e6', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'inherit' }}
                        />

                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e6e6e6', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>添加图片（可选）</h4>
                            <ImageUpload onImagesChange={setCommentImages} maxImages={6} existingImages={commentImages} />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !commentContent.trim()}
                            style={{ padding: '0.6rem 1.2rem', background: '#0ea5ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                            {submitting ? '发表中...' : '发表评论'}
                        </button>
                    </form>
                </div>

                {/* 评论列表 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#888' }}>暂无评论，来发表第一条吧~</div>
                    ) : (
                        comments.map((c) => {
                            const isCommentAuthor = currentUserId === c.author?._id || currentUserId === c.author?.id;
                            const isEditingThisComment = editingCommentId === c._id;

                            return (
                                <div key={c._id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem' }}>
                                    {/* 评论者信息 */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar src={c.author?.avatar} username={c.author?.username || '匿名'} size="small" />
                                            <div style={{ marginLeft: '0.5rem', flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: '#222', fontSize: '0.95rem' }}>{c.author?.username || '匿名'}</div>
                                                <div style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        {isCommentAuthor && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditComment(c)}
                                                    style={{ padding: '0.3rem 0.6rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(c._id)}
                                                    style={{ padding: '0.3rem 0.6rem', background: '#f87171', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditingThisComment ? (
                                        <>
                                            {/* 评论内容 */}
                                            <div style={{ color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '0.75rem', marginLeft: '2.5rem' }}>{c.content}</div>

                                            {/* 评论图片 */}
                                            {c.images && c.images.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem', marginLeft: '2.5rem' }}>
                                                    {c.images.map((img: string, idx: number) => (
                                                        <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* 评论互动按钮 */}
                                            <div style={{ marginLeft: '2.5rem' }}>
                                                <InteractionButton
                                                    initialLikeCount={c.likes?.length || 0}
                                                    initialUserLiked={currentUserId ? c.likes?.includes(currentUserId) : false}
                                                    onLike={() => handleLikeComment(c._id)}
                                                    size="small"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* 编辑评论表单 */}
                                            <div style={{ marginLeft: '2.5rem' }}>
                                                <textarea
                                                    value={editCommentData.content}
                                                    onChange={(e) => setEditCommentData({ ...editCommentData, content: e.target.value })}
                                                    rows={3}
                                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'inherit' }}
                                                />

                                                <div style={{ marginBottom: '1rem' }}>
                                                    <ImageUpload onImagesChange={(imgs) => setEditCommentData({ ...editCommentData, images: imgs })} maxImages={6} existingImages={editCommentData.images} />
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleSaveCommentEdit(c._id)}
                                                        disabled={isEditingCommentSubmitting}
                                                        style={{ padding: '0.6rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: isEditingCommentSubmitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                                                    >
                                                        {isEditingCommentSubmitting ? '保存中...' : '保存'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        style={{ padding: '0.6rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                                                    >
                                                        取消
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
