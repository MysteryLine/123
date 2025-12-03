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

  const sizeClasses = size === 'small' ? 'text-sm px-2 py-1' : 'text-base px-3 py-1.5';

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses} flex items-center gap-1 rounded-full border transition-all ${
        isLiked
          ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}`}
        viewBox="0 0 20 20"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
      <span className="font-medium">{likesCount}</span>
    </button>
  );
};

export default LikeButton;
