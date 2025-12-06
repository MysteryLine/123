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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

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

                // 获取帖子列表（分页）
                const response = await api.posts.getAll(currentPage, pageSize);
                if (response.data.success) {
                    setPosts(response.data.posts || []);
                    setTotalPages(response.data.pagination.totalPages);
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
    }, [currentPage]);

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

    if (loading) return <main style={{ padding: '2rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</main>;
    if (error) return <main style={{ padding: '2rem', color: '#c00', minHeight: '100vh' }}>{error}</main>;

    return (
        <main style={styles.main}>
            {/* 顶部导航区 */}
            <div style={styles.headerSection}>
                <div style={styles.headerContainer}>
                    <div>
                        <h1 style={styles.title}>社区帖子</h1>
                        <p style={styles.subtitle}>发现有趣的想法和讨论</p>
                    </div>
                    <Link href="/posts/create">
                        <button style={styles.createButton}>
                            <span style={{ marginRight: '0.5rem' }}>✍️</span>发布帖子
                        </button>
                    </Link>
                </div>
            </div>

            {/* 主内容区 */}
            <div style={styles.container}>
                {posts.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <div style={styles.emptyText}>还没有帖子呢</div>
                        <div style={styles.emptySubtext}>快来发布第一个帖子，开启有趣的讨论吧</div>
                    </div>
                ) : (
                    <div style={styles.postsList}>
                        {posts.map((p) => (
                            <div key={p._id} style={styles.postCard}>
                                {/* 作者信息栏 */}
                                <div style={styles.authorBar}>
                                    <Link href={`/profile/${p.author._id}`} style={{ textDecoration: 'none' }}>
                                        <div style={styles.authorInfo}>
                                            <Avatar src={p.author?.avatar} username={p.author?.username || '匿名'} size="medium" />
                                            <div style={styles.authorDetails}>
                                                <div style={styles.authorName}>{p.author?.username || '匿名'}</div>
                                                <div style={styles.postTime}>{new Date(p.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* 帖子内容 */}
                                <Link href={`/posts/${p._id}`} style={{ textDecoration: 'none' }}>
                                    <div style={styles.postContent}>
                                        <h2 style={styles.postTitle}>{p.title}</h2>
                                        <p style={styles.postPreview}>
                                            {p.content.substring(0, 200)}{p.content.length > 200 ? '...' : ''}
                                        </p>

                                        {/* 图片网格 */}
                                        {p.images && p.images.length > 0 && (
                                            <div style={styles.imageGrid}>
                                                {p.images.slice(0, 3).map((img: string, idx: number) => (
                                                    <img key={idx} src={img} alt={`图片 ${idx + 1}`} style={styles.gridImage} />
                                                ))}
                                                {p.images.length > 3 && (
                                                    <div style={styles.moreImagesOverlay}>+{p.images.length - 3}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* 互动栏 */}
                                <div style={styles.actionBar}>
                                    <div style={styles.actionGroup}>
                                        <LikeButton
                                            initialCount={p.likes?.length || 0}
                                            initialIsLiked={currentUserId ? p.likes?.includes(currentUserId) : false}
                                            onToggle={() => handleLikePost(p._id)}
                                            size="medium"
                                        />
                                    </div>
                                    <div style={styles.stat}>
                                        <span style={styles.statIcon}>💬</span>
                                        <span>{p.comments?.length || 0}</span>
                                    </div>
                                    <div style={styles.stat}>
                                        <span style={styles.statIcon}>👁️</span>
                                        <span>{p.views || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 分页 */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
                        >
                            ← 上一页
                        </button>

                        <div style={styles.pageNumbers}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                                if (pageNum > totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={{...styles.pageBtn, ...(currentPage === pageNum ? styles.pageBtnActive : {})}}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
                        >
                            下一页 →
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #fef3f8 100%)',
    },
    headerSection: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
        color: '#fff',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
    },
    headerContainer: {
        maxWidth: 1000,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 800,
        margin: 0,
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1rem',
        opacity: 0.95,
        margin: 0,
        fontWeight: 300,
    },
    createButton: {
        padding: '0.8rem 1.5rem',
        background: '#fff',
        color: '#667eea',
        border: 'none',
        borderRadius: '50px',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
    } as React.CSSProperties,
    container: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '2rem',
    },
    postsList: {
        display: 'grid',
        gap: '1.5rem',
    },
    postCard: {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    } as React.CSSProperties,
    authorBar: {
        padding: '1.5rem 1.5rem 1rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
    authorInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    } as React.CSSProperties,
    authorDetails: {
        flex: 1,
    },
    authorName: {
        fontWeight: 700,
        fontSize: '1rem',
        color: '#1a1a1a',
    },
    postTime: {
        fontSize: '0.85rem',
        color: '#888',
        marginTop: '0.25rem',
    },
    postContent: {
        padding: '1.5rem',
    },
    postTitle: {
        fontSize: '1.4rem',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 0.75rem 0',
        lineHeight: 1.4,
    },
    postPreview: {
        fontSize: '1rem',
        color: '#555',
        lineHeight: 1.6,
        margin: '0 0 1.5rem 0',
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.75rem',
        marginTop: '1.5rem',
    },
    gridImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '8px',
        cursor: 'pointer',
    } as React.CSSProperties,
    moreImagesOverlay: {
        width: '100%',
        height: '150px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.2rem',
    },
    actionBar: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    actionGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    } as React.CSSProperties,
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
        color: '#666',
    } as React.CSSProperties,
    statIcon: {
        fontSize: '1.1rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        borderRadius: '16px',
        background: '#f9fafb',
        border: '2px dashed #e5e7eb',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
    },
    emptyText: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '0.5rem',
    },
    emptySubtext: {
        fontSize: '1rem',
        color: '#888',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '3rem',
        padding: '2rem 0',
    },
    paginationBtn: {
        padding: '0.6rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        color: '#333',
        transition: 'all 0.2s',
    } as React.CSSProperties,
    paginationBtnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: '#f5f5f5',
    },
    pageNumbers: {
        display: 'flex',
        gap: '0.5rem',
    } as React.CSSProperties,
    pageBtn: {
        padding: '0.6rem 0.8rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        background: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        color: '#333',
        transition: 'all 0.2s',
    } as React.CSSProperties,
    pageBtnActive: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
    },
};
