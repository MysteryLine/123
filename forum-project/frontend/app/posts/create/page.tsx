"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/lib/apiClient';

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.posts.create({ title, content, images });
            if (res.data.success) {
                router.push(`/posts/${res.data.post._id}`);
            } else {
                setError(res.data.message || '发布失败');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '网络错误，发布失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ padding: '2rem', background: '#f7f8fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: '2rem' }}>
                <h1 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>发布新帖子</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" required style={{ padding: '0.8rem', borderRadius: 8, border: '1px solid #e6e6e6', fontSize: '1rem' }} />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="内容" rows={8} required style={{ padding: '0.8rem', borderRadius: 8, border: '1px solid #e6e6e6', fontSize: '1rem' }} />

                    <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e6e6e6' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.8rem', color: '#666' }}>添加图片（可选）</h3>
                        <ImageUpload onImagesChange={setImages} maxImages={9} />
                    </div>

                    <button type="submit" disabled={loading} style={{ padding: '0.8rem', background: '#0ea5ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>{loading ? '发布中...' : '发布'}</button>
                    {error && <div style={{ color: '#c00' }}>{error}</div>}
                </form>
            </div>
        </main>
    );
}
