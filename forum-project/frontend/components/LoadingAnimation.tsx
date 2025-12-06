'use client';

import React, { useEffect, useState } from 'react';

const loadingMessages = [
    '加载中...',
    '正在获取精彩内容...',
    '马上为你呈现...',
];

export default function LoadingAnimation() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* 动画球球 */}
                <div style={styles.orbContainer}>
                    <div style={styles.orb}></div>
                </div>

                {/* 加载文字 */}
                <div style={styles.message}>
                    {loadingMessages[messageIndex]}
                </div>
            </div>

            <style jsx>{`
        @keyframes orbPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 50px rgba(59, 130, 246, 0.9);
          }
        }
      `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    content: {
        textAlign: 'center',
        position: 'relative',
    },
    orbContainer: {
        width: '80px',
        height: '80px',
        margin: '0 auto 40px',
        position: 'relative',
    },
    orb: {
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(59, 130, 246, 0.4))',
        borderRadius: '50%',
        animation: 'orbPulse 2s ease-in-out infinite',
    },
    message: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#ffffff',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
};
