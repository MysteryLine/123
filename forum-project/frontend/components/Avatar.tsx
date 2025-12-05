'use client';

import React from 'react';

interface AvatarProps {
    src?: string | null;
    username: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    editable?: boolean;
    onEdit?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    username,
    size = 'medium',
    className = '',
    editable = false,
    onEdit,
}) => {
    const sizeClasses = {
        small: 'w-8 h-8 text-sm',
        medium: 'w-10 h-10 text-base',
        large: 'w-16 h-16 text-2xl',
    };

    // 获取用户名首字母作为默认头像
    const initial = username ? username[0].toUpperCase() : '?';

    // 生成随机背景色（基于用户名）
    const getBackgroundColor = (name: string) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-teal-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (src) {
        return (
            <div className="relative">
                <img
                    src={src}
                    alt={`${username} 的头像`}
                    className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
                />
                {editable && onEdit && (
                    <button
                        onClick={onEdit}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-all"
                        title="编辑头像"
                    >
                        ✏️
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                className={`${sizeClasses[size]} ${getBackgroundColor(username)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
            >
                {initial}
            </div>
            {editable && onEdit && (
                <button
                    onClick={onEdit}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-all"
                    title="编辑头像"
                >
                    ✏️
                </button>
            )}
        </div>
    );
};

export default Avatar;
