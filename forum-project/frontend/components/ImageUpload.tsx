'use client';

import { useState } from 'react';
import { api } from '@/lib/apiClient';

interface ImageUploadProps {
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
    existingImages?: string[];
}

export default function ImageUpload({
    onImagesChange,
    maxImages = 9,
    existingImages = []
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>(existingImages);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // 检查图片数量限制
        if (images.length + files.length > maxImages) {
            setError(`最多只能上传 ${maxImages} 张图片`);
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            // 获取上传凭证
            const tokenRes = await api.upload.getToken();
            const { token, domain } = tokenRes.data;
            console.log('获取到上传凭证，domain:', domain);

            const uploadPromises = Array.from(files).map(async (file) => {
                // 检查文件类型
                if (!file.type.startsWith('image/')) {
                    throw new Error('只能上传图片文件');
                }

                // 检查文件大小（限制 5MB）
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('图片大小不能超过 5MB');
                }

                // 生成唯一文件名
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 15);
                const ext = file.name.split('.').pop();
                const key = `forum/${timestamp}_${randomStr}.${ext}`;

                // 构造上传表单
                const formData = new FormData();
                formData.append('file', file);
                formData.append('token', token);
                formData.append('key', key);

                // 上传到七牛云
                const response = await fetch('https://up-as0.qiniup.com', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('七牛云上传错误:', response.status, errorText);
                    throw new Error(`上传失败: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                setUploadProgress(prev => Math.min(prev + (100 / Array.from(files).length), 90));
                return `${domain}/${result.key}`;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onImagesChange(newImages);
            setUploadProgress(100);
        } catch (err: any) {
            console.error('上传失败:', err);
            setError(err.message || '上传失败，请重试');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    const canUploadMore = images.length < maxImages;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* 上传区域 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
            }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading || !canUploadMore}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        disabled={uploading || !canUploadMore}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            background: uploading ? '#94a3b8' : '#0ea5ff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: uploading || !canUploadMore ? 'not-allowed' : 'pointer',
                            opacity: uploading || !canUploadMore ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!uploading && canUploadMore) {
                                (e.currentTarget as HTMLButtonElement).style.background = '#0284c7';
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = '#0ea5ff';
                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>🖼️</span>
                        <span>{uploading ? '上传中...' : '选择图片'}</span>
                    </button>
                </label>

                {/* 进度条 */}
                {uploading && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            flex: 1,
                            height: '4px',
                            background: '#e2e8f0',
                            borderRadius: '2px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #0ea5ff, #06b6d4)',
                                width: `${uploadProgress}%`,
                                transition: 'width 0.3s ease',
                            }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '30px' }}>
                            {uploadProgress}%
                        </span>
                    </div>
                )}

                {/* 数量显示 */}
                <div style={{
                    padding: '0.4rem 0.8rem',
                    background: canUploadMore ? '#e0f2fe' : '#fce7f3',
                    color: canUploadMore ? '#0369a1' : '#be185d',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                }}>
                    {images.length}/{maxImages}
                </div>
            </div>

            {/* 错误信息 */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* 图片预览 */}
            {images.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '0.75rem',
                    padding: '0.5rem',
                }}>
                    {images.map((url, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                background: '#f1f5f9',
                            }}
                            onMouseEnter={(e) => {
                                const btn = (e.currentTarget as HTMLElement).querySelector('button') as HTMLButtonElement;
                                if (btn) btn.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                const btn = (e.currentTarget as HTMLElement).querySelector('button') as HTMLButtonElement;
                                if (btn) btn.style.opacity = '0';
                            }}
                        >
                            <img
                                src={url}
                                alt={`预览 ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    aspectRatio: '1',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                                }}
                                onClick={() => window.open(url, '_blank')}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '28px',
                                    height: '28px',
                                    padding: '0',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = '#dc2626';
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 使用提示 */}
            <div style={{
                fontSize: '0.8rem',
                color: '#64748b',
                padding: '0.5rem 0',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
            }}>
                <span>📸 最大 {maxImages} 张图片</span>
                <span>📦 单张不超过 5MB</span>
                <span>🖼️ 支持 JPG/PNG/GIF</span>
            </div>
        </div>
    );
}
