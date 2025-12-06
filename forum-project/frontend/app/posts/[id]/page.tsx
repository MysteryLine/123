"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
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
        <main style={styles.main}>
            {/* 返回按钮 */}
            <div style={styles.backBar}>
                <button onClick={() => router.back()} style={styles.backButton}>← 返回</button>
            </div>

            <div style={styles.container}>
                {/* 帖子卡片 */}
                <article style={styles.postCard}>
                    {/* 作者信息 */}
                    <div style={styles.authorHeader}>
                        <div style={styles.authorInfo}>
                            <Avatar src={post.author?.avatar} username={post.author?.username || '匿名'} size="large" />
                            <div style={styles.authorMeta}>
                                <h3 style={styles.authorName}>{post.author?.username || '匿名'}</h3>
                                <p style={styles.postDate}>{new Date(post.createdAt).toLocaleString()}</p>
                                {post.updatedAt !== post.createdAt && (
                                    <p style={styles.editedDate}>已编辑</p>
                                )}
                            </div>
                        </div>
                        {isPostAuthor && (
                            <div style={styles.postActions}>
                                <button onClick={() => setIsEditingPost(true)} style={styles.editButton}>编辑</button>
                                <button onClick={handleDeletePost} style={styles.deleteButton}>删除</button>
                            </div>
                        )}
                    </div>

                    {/* 帖子内容 */}
                    {isEditingPost ? (
                        <div style={styles.editForm}>
                            <input
                                type="text"
                                value={editPostData.title}
                                onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                                style={styles.editInput}
                                placeholder="标题"
                            />
                            <textarea
                                value={editPostData.content}
                                onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                                style={styles.editTextarea}
                                placeholder="内容"
                            />
                            <ImageUpload onImagesChange={(imgs: string[]) => setEditPostData({ ...editPostData, images: imgs })} />
                            <div style={styles.editButtons}>
                                <button onClick={handleEditPost} disabled={isEditingPostSubmitting} style={styles.saveButton}>
                                    {isEditingPostSubmitting ? '保存中...' : '保存'}
                                </button>
                                <button onClick={() => setIsEditingPost(false)} style={styles.cancelButton}>取消</button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.postContent}>
                            <h1 style={styles.postTitle}>{post.title}</h1>
                            <p style={styles.postText}>{post.content}</p>

                            {/* 帖子图片 */}
                            {post.images && post.images.length > 0 && (
                                <div style={styles.imageGallery}>
                                    {post.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={styles.galleryImage} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 互动栏 */}
                    <div style={styles.interactionBar}>
                        <LikeButton
                            initialCount={post.likes?.length || 0}
                            initialIsLiked={currentUserId ? post.likes?.includes(currentUserId) : false}
                            onToggle={handleLikePost}
                        />
                        <div style={styles.stat}>
                            <span>💬</span>
                            <span>{comments.length} 评论</span>
                        </div>
                        <div style={styles.stat}>
                            <span>👁️</span>
                            <span>{post.views || 0} 浏览</span>
                        </div>
                    </div>
                </article>

                {/* 评论区 */}
                <section style={styles.commentsSection}>
                    <h2 style={styles.commentsTitle}>评论 ({comments.length})</h2>

                    {/* 发表评论表单 */}
                    <form onSubmit={handleAddComment} style={styles.commentForm}>
                        <div style={styles.commentInputWrapper}>
                            <Avatar src={null} username="你" size="medium" />
                            <textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="分享你的想法..."
                                style={styles.commentInput}
                            />
                        </div>
                        {commentImages.length > 0 && (
                            <div style={styles.selectedImages}>
                                {commentImages.map((img, idx) => (
                                    <div key={idx} style={styles.selectedImageWrapper}>
                                        <img src={img} alt={`选中 ${idx + 1}`} style={styles.selectedImage} />
                                        <button
                                            type="button"
                                            onClick={() => setCommentImages(commentImages.filter((_, i) => i !== idx))}
                                            style={styles.removeImageBtn}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={styles.commentFormFooter}>
                            <ImageUpload onImagesChange={(imgs: string[]) => setCommentImages(imgs)} />
                            <button type="submit" disabled={submitting || !commentContent.trim()} style={styles.submitButton}>
                                {submitting ? '发表中...' : '发表评论'}
                            </button>
                        </div>
                    </form>

                    {/* 评论列表 */}
                    <div style={styles.commentsList}>
                        {comments.length === 0 ? (
                            <div style={styles.noComments}>暂无评论，抢沙发~</div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} style={styles.commentItem}>
                                    <div style={styles.commentHeader}>
                                        <div style={styles.commentAuthor}>
                                            <Avatar src={comment.author?.avatar} username={comment.author?.username || '匿名'} size="small" />
                                            <div>
                                                <h4 style={styles.commentAuthorName}>{comment.author?.username || '匿名'}</h4>
                                                <p style={styles.commentTime}>{new Date(comment.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {(currentUserId === comment.author?._id || currentUserId === comment.author?.id) && (
                                            <div style={styles.commentActions}>
                                                <button onClick={() => handleEditComment(comment)} style={styles.actionBtn}>编辑</button>
                                                <button onClick={() => handleDeleteComment(comment._id)} style={styles.actionBtn}>删除</button>
                                            </div>
                                        )}
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div style={styles.editCommentForm}>
                                            <textarea
                                                value={editCommentData.content}
                                                onChange={(e) => setEditCommentData({ ...editCommentData, content: e.target.value })}
                                                style={styles.editCommentInput}
                                            />
                                            <div style={styles.editCommentButtons}>
                                                <button onClick={() => handleSaveCommentEdit(comment._id)} disabled={isEditingCommentSubmitting} style={styles.saveBtn}>
                                                    {isEditingCommentSubmitting ? '保存中...' : '保存'}
                                                </button>
                                                <button onClick={() => setEditingCommentId(null)} style={styles.cancelBtn}>取消</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={styles.commentText}>{comment.content}</p>
                                            {comment.images && comment.images.length > 0 && (
                                                <div style={styles.commentImages}>
                                                    {comment.images.map((img: string, idx: number) => (
                                                        <img key={idx} src={img} alt={`评论图片 ${idx + 1}`} style={styles.commentImage} />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div style={styles.commentInteraction}>
                                        <LikeButton
                                            initialCount={comment.likes?.length || 0}
                                            initialIsLiked={currentUserId ? comment.likes?.includes(currentUserId) : false}
                                            onToggle={() => handleLikeComment(comment._id)}
                                            size="small"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                main > div:first-child {
                    animation: slideIn 0.4s ease-out;
                }
            `}</style>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #fef3f8 100%)',
        padding: '2rem 0',
    },
    backBar: {
        padding: '1rem 2rem',
        maxWidth: 900,
        margin: '0 auto',
    },
    backButton: {
        padding: '0.5rem 1rem',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#333',
        transition: 'all 0.2s',
    } as React.CSSProperties,
    container: {
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 2rem',
    },
    postCard: {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    authorHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
    authorInfo: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
    } as React.CSSProperties,
    authorMeta: {
        flex: 1,
    },
    authorName: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: 0,
    },
    postDate: {
        fontSize: '0.9rem',
        color: '#888',
        margin: '0.25rem 0 0 0',
    },
    editedDate: {
        fontSize: '0.8rem',
        color: '#999',
        fontStyle: 'italic',
        margin: '0.25rem 0 0 0',
    },
    postActions: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    editButton: {
        padding: '0.5rem 1rem',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
    } as React.CSSProperties,
    deleteButton: {
        padding: '0.5rem 1rem',
        background: '#ff6b6b',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
    } as React.CSSProperties,
    postContent: {},
    postTitle: {
        fontSize: '2rem',
        fontWeight: 800,
        color: '#1a1a1a',
        margin: '0 0 1rem 0',
        lineHeight: 1.4,
    },
    postText: {
        fontSize: '1.05rem',
        color: '#333',
        lineHeight: 1.8,
        margin: '0 0 1.5rem 0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    imageGallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    galleryImage: {
        width: '100%',
        height: '300px',
        objectFit: 'cover',
        borderRadius: '12px',
        cursor: 'pointer',
    } as React.CSSProperties,
    interactionBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        marginTop: '1.5rem',
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        color: '#666',
    } as React.CSSProperties,
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    } as React.CSSProperties,
    editInput: {
        padding: '0.8rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'inherit',
    } as React.CSSProperties,
    editTextarea: {
        padding: '0.8rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        minHeight: '200px',
        resize: 'vertical',
    } as React.CSSProperties,
    editButtons: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    saveButton: {
        padding: '0.6rem 1.2rem',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
    } as React.CSSProperties,
    cancelButton: {
        padding: '0.6rem 1.2rem',
        background: '#ddd',
        color: '#333',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
    } as React.CSSProperties,
    commentsSection: {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    commentsTitle: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 2rem 0',
    },
    commentForm: {
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
    commentInputWrapper: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    } as React.CSSProperties,
    commentInput: {
        flex: 1,
        padding: '0.8rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        minHeight: '100px',
        resize: 'vertical',
    } as React.CSSProperties,
    selectedImages: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    selectedImageWrapper: {
        position: 'relative',
        width: '80px',
        height: '80px',
    } as React.CSSProperties,
    selectedImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
    } as React.CSSProperties,
    removeImageBtn: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '24px',
        height: '24px',
        background: '#ff6b6b',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontWeight: 700,
    } as React.CSSProperties,
    commentFormFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    } as React.CSSProperties,
    submitButton: {
        padding: '0.6rem 1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s',
    } as React.CSSProperties,
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    } as React.CSSProperties,
    commentItem: {
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
    },
    commentAuthor: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
    } as React.CSSProperties,
    commentAuthorName: {
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: 0,
    },
    commentTime: {
        fontSize: '0.8rem',
        color: '#888',
        margin: '0.25rem 0 0 0',
    },
    commentActions: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    actionBtn: {
        padding: '0.4rem 0.8rem',
        background: 'transparent',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: '#666',
        fontWeight: 600,
    } as React.CSSProperties,
    commentText: {
        margin: '0 0 0.75rem 0',
        fontSize: '1rem',
        color: '#333',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    commentImages: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '0.5rem',
        marginTop: '0.75rem',
    },
    commentImage: {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '6px',
    } as React.CSSProperties,
    commentInteraction: {
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    },
    noComments: {
        textAlign: 'center',
        padding: '3rem 0',
        color: '#999',
        fontSize: '1rem',
    },
    editCommentForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
    } as React.CSSProperties,
    editCommentInput: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        minHeight: '80px',
    } as React.CSSProperties,
    editCommentButtons: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    saveBtn: {
        padding: '0.4rem 0.8rem',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.85rem',
    } as React.CSSProperties,
    cancelBtn: {
        padding: '0.4rem 0.8rem',
        background: '#ddd',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.85rem',
    } as React.CSSProperties,
};
