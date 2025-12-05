'use client';

import React, { useState } from 'react';

interface LikeButtonProps {
    initialCount: number;
    initialIsLiked: boolean;
    onToggle: () => Promise<{ likesCount: number; isLiked: boolean }>;
    size?: 'small' | 'medium';
}

const LikeButton: React.FC<LikeButtonProps> = ({
    initialCount,
    initialIsLiked,
    onToggle,
    size = 'medium',
}) => {
    const [likesCount, setLikesCount] = useState(initialCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const result = await onToggle();
            setLikesCount(result.likesCount);
            setIsLiked(result.isLiked);
        } catch (error) {
            console.error('点赞失败:', error);
            alert('操作失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    const sizeConfig = size === 'small'
        ? { iconSize: 18, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }
        : { iconSize: 20, padding: '0.6rem 1rem', fontSize: '0.95rem' };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: sizeConfig.padding,
                fontSize: sizeConfig.fontSize,
                fontWeight: '600',
                border: '1px solid',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isLiked ? '#fee2e2' : '#ffffff',
                borderColor: isLiked ? '#f87171' : '#e5e7eb',
                color: isLiked ? '#dc2626' : '#666666',
                opacity: isLoading ? 0.6 : 1,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={sizeConfig.iconSize}
                height={sizeConfig.iconSize}
                viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
            >
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
            </svg>
            <span>{likesCount}</span>
        </button>
    );
};

export default LikeButton;
