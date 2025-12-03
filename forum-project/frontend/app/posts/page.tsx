"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
                const base = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;
                const res = await fetch(`${base}/api/posts`);
                const data = await res.json();
                if (data.success) setPosts(data.posts || []);
                else setError(data.message || '获取帖子失败');
            } catch (err) {
                setError('网络错误，无法获取帖子');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {posts.map((p) => (
                            <Link key={p._id} href={`/posts/${p._id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '1.5rem', transition: 'box-shadow 0.2s', cursor: 'pointer', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#222', marginBottom: '0.5rem' }}>{p.title}</div>
                                    <div style={{ color: '#666', fontSize: '0.95rem' }}>作者：{p.author?.username || '匿名'} · {new Date(p.createdAt).toLocaleString()}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
