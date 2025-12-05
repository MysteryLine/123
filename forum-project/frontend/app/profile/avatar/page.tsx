'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarEditor from '@/components/AvatarEditor';
import { api } from '@/lib/apiClient';

export default function AvatarEditPage() {
    const router = useRouter();
    const [isEditorOpen, setIsEditorOpen] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const handleAvatarComplete = async (avatarBase64: string) => {
        setIsUploading(true);
        setUploadError('');

        try {
            const response = await api.upload.uploadAvatar(avatarBase64);
            if (response.data.success) {
                setUploadSuccess('✅ 头像已成功更新！');
                setIsEditorOpen(false);

                // 3秒后重定向到个人资料页
                setTimeout(() => {
                    window.location.href = '/profile';
                }, 2000);
            } else {
                setUploadError(response.data.message || '上传失败');
                setIsUploading(false);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || '头像上传失败，请重试';
            setUploadError(message);
            console.error('头像上传失败:', error);
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div style={styles.page}>
            {isEditorOpen && !isUploading && (
                <AvatarEditor onComplete={handleAvatarComplete} onCancel={handleCancel} />
            )}

            {isUploading && (
                <div style={styles.modal}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>正在上传头像...</p>
                    </div>
                </div>
            )}

            {uploadError && (
                <div style={styles.modal}>
                    <div style={styles.errorContainer}>
                        <h3 style={styles.errorTitle}>❌ 上传失败</h3>
                        <p style={styles.errorMessage}>{uploadError}</p>
                        <button
                            onClick={() => {
                                setUploadError('');
                                setIsEditorOpen(true);
                            }}
                            style={styles.retryBtn}
                        >
                            重新尝试
                        </button>
                    </div>
                </div>
            )}

            {uploadSuccess && (
                <div style={styles.modal}>
                    <div style={styles.successContainer}>
                        <h3 style={styles.successTitle}>{uploadSuccess}</h3>
                        <p style={styles.successMessage}>即将跳转回个人资料页...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #4a90e2',
        borderRadius: '50%',
        margin: '0 auto 20px',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        margin: '0',
        fontSize: '16px',
        color: '#333',
        fontWeight: '500',
    },
    errorContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
    },
    errorTitle: {
        margin: '0 0 12px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#d32f2f',
    },
    errorMessage: {
        margin: '0 0 20px 0',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5',
    },
    retryBtn: {
        backgroundColor: '#4a90e2',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    successContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
    },
    successTitle: {
        margin: '0 0 12px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2e7d32',
    },
    successMessage: {
        margin: '0',
        fontSize: '14px',
        color: '#666',
    },
};

// 添加动画样式
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);
}
