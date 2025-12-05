'use client';

import React, { useState, useRef } from 'react';

interface FloatingMessage {
    id: string;
    text: string;
    x: number;
    y: number;
}

interface InteractionButtonProps {
    initialLikeCount?: number;
    initialDislikeCount?: number;
    initialUserLiked?: boolean;
    initialUserDisliked?: boolean;
    onLike?: () => void;
    onDislike?: () => void;
    size?: 'small' | 'medium' | 'large';
}

// 趣味提示词
const LIKE_MESSAGES = [
    '太棒了！👍',
    '我喜欢！❤️',
    '你真幽默！😂',
    '深表赞同！💯',
    '绝妙的想法！✨',
    '让我点个赞！🌟',
];

const DISLIKE_MESSAGES = [
    '别踩啦，作者会哭的😭',
    '手下留情～🥺',
    '都是误会呀～',
    '给我一次改过的机会吧！😢',
    '我会改进的，相信我！💪',
    '请不要伤害我QAQ',
    '其实我很努力的…',
    '有什么问题请指正👉',
];

export default function InteractionButton({
    initialLikeCount = 0,
    initialDislikeCount = 0,
    initialUserLiked = false,
    initialUserDisliked = false,
    onLike,
    onDislike,
    size = 'medium',
}: InteractionButtonProps) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
    const [isUserLiked, setIsUserLiked] = useState(initialUserLiked);
    const [isUserDisliked, setIsUserDisliked] = useState(initialUserDisliked);
    const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const getRandomMessage = (messages: string[]) => {
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const addFloatingMessage = (message: string, isDislike: boolean = false) => {
        const id = Math.random().toString(36);
        const container = containerRef.current;

        if (container) {
            const rect = container.getBoundingClientRect();
            const x = rect.width / 2;
            const y = rect.height / 2;

            setFloatingMessages(prev => [...prev, { id, text: message, x, y }]);

            setTimeout(() => {
                setFloatingMessages(prev => prev.filter(msg => msg.id !== id));
            }, 2000);
        }
    };

    const handleLike = async () => {
        try {
            if (isUserLiked) {
                setLikeCount(Math.max(0, likeCount - 1));
                setIsUserLiked(false);
            } else {
                setLikeCount(likeCount + 1);
                setIsUserLiked(true);
                if (isUserDisliked) {
                    setDislikeCount(Math.max(0, dislikeCount - 1));
                    setIsUserDisliked(false);
                }
                addFloatingMessage(getRandomMessage(LIKE_MESSAGES));
            }
            await onLike?.();
        } catch (error) {
            console.error('点赞失败:', error);
            // 如果失败，回滚状态
            if (isUserLiked) {
                setIsUserLiked(true);
                setLikeCount(likeCount);
            } else {
                setIsUserLiked(false);
                setLikeCount(Math.max(0, likeCount - 1));
            }
        }
    };

    const handleDislike = async () => {
        try {
            if (isUserDisliked) {
                setDislikeCount(Math.max(0, dislikeCount - 1));
                setIsUserDisliked(false);
            } else {
                setDislikeCount(dislikeCount + 1);
                setIsUserDisliked(true);
                if (isUserLiked) {
                    setLikeCount(Math.max(0, likeCount - 1));
                    setIsUserLiked(false);
                }
                addFloatingMessage(getRandomMessage(DISLIKE_MESSAGES), true);
            }
            await onDislike?.();
        } catch (error) {
            console.error('踩失败:', error);
            // 如果失败，回滚状态
            if (isUserDisliked) {
                setIsUserDisliked(true);
                setDislikeCount(dislikeCount);
            } else {
                setIsUserDisliked(false);
                setDislikeCount(Math.max(0, dislikeCount - 1));
            }
        }
    };

    const sizeStyles = {
        small: {
            buttonHeight: '28px',
            fontSize: '0.8rem',
            padding: '0.3rem 0.6rem',
            gapSize: '0.3rem',
        },
        medium: {
            buttonHeight: '36px',
            fontSize: '0.95rem',
            padding: '0.5rem 1rem',
            gapSize: '0.5rem',
        },
        large: {
            buttonHeight: '44px',
            fontSize: '1.1rem',
            padding: '0.6rem 1.2rem',
            gapSize: '0.75rem',
        },
    };

    const style = sizeStyles[size];

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                display: 'flex',
                gap: style.gapSize,
                alignItems: 'center',
                userSelect: 'none',
            }}
        >
            {/* 点赞按钮 */}
            <button
                onClick={handleLike}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: style.padding,
                    height: style.buttonHeight,
                    background: isUserLiked ? '#dcfce7' : '#ffffff',
                    color: isUserLiked ? '#16a34a' : '#666666',
                    border: isUserLiked ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: style.fontSize,
                    fontWeight: isUserLiked ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                }}
                onMouseOver={(e) => {
                    if (!isUserLiked) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isUserLiked) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                    }
                }}
            >
                <span style={{ fontSize: size === 'small' ? '0.9rem' : '1rem' }}>👍</span>
                <span>{likeCount}</span>
            </button>

            {/* 踩按钮 */}
            <button
                onClick={handleDislike}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: style.padding,
                    height: style.buttonHeight,
                    background: isUserDisliked ? '#fee2e2' : '#ffffff',
                    color: isUserDisliked ? '#dc2626' : '#666666',
                    border: isUserDisliked ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: style.fontSize,
                    fontWeight: isUserDisliked ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                }}
                onMouseOver={(e) => {
                    if (!isUserDisliked) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isUserDisliked) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                    }
                }}
            >
                <span style={{ fontSize: size === 'small' ? '0.9rem' : '1rem' }}>👎</span>
                <span>{dislikeCount}</span>
            </button>

            {/* 飘浮文字动效 */}
            {floatingMessages.map((msg) => (
                <div
                    key={msg.id}
                    style={{
                        position: 'absolute',
                        left: `${msg.x}px`,
                        top: `${msg.y}px`,
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                    }}
                >
                    <style>{`
                        @keyframes floatUp {
                            0% {
                                transform: translate(-50%, -50%) translateY(0) scale(1);
                                opacity: 1;
                            }
                            100% {
                                transform: translate(-50%, -50%) translateY(-60px) scale(0.9);
                                opacity: 0;
                            }
                        }
                        .floating-message {
                            animation: floatUp 2s ease-out forwards;
                            white-space: nowrap;
                            font-weight: 600;
                            font-size: 0.95rem;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .floating-message-like {
                            color: #16a34a;
                        }
                        .floating-message-dislike {
                            color: #dc2626;
                        }
                    `}</style>
                    <div
                        className={`floating-message ${msg.text.includes('踩') ||
                                msg.text.includes('哭') ||
                                msg.text.includes('手下') ||
                                msg.text.includes('误会') ||
                                msg.text.includes('改过') ||
                                msg.text.includes('伤害') ||
                                msg.text.includes('努力') ||
                                msg.text.includes('指正')
                                ? 'floating-message-dislike'
                                : 'floating-message-like'
                            }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
        </div>
    );
}
