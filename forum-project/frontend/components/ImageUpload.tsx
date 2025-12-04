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
                return `${domain}/${result.key}`;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedUrls];
            setImages(newImages);
            onImagesChange(newImages);
        } catch (err: any) {
            console.error('上传失败:', err);
            setError(err.message || '上传失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading || images.length >= maxImages}
                        className="hidden"
                    />
                    <button
                        type="button"
                        disabled={uploading || images.length >= maxImages}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                        }}
                    >
                        {uploading ? '上传中...' : '📷'}
                    </button>
                </label>
                <span className="text-xs text-gray-500 font-medium">
                    {images.length}/{maxImages}
                </span>
            </div>

            {error && (
                <div className="text-red-500 text-xs p-1.5 bg-red-50 rounded">
                    {error}
                </div>
            )}

            {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`预览 ${index + 1}`}
                                className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
