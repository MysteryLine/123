'use client';

import React, { useEffect, useState } from 'react';

const loadingMessages = [
  '🚀 正在加载精彩内容...',
  '✨ 马上就好...',
  '🎨 准备中...',
  '🌟 即将呈现...',
  '💫 稍等片刻...',
  '🎯 加载中...',
];

export default function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // 切换消息
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    // 动画点点点
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 旋转的圆圈动画 */}
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.spinnerInner}></div>
        </div>

        {/* 加载消息 */}
        <div style={styles.message}>
          {loadingMessages[messageIndex]}
          <span style={styles.dots}>{dots}</span>
        </div>

        {/* 进度条动画 */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>

        {/* 装饰元素 */}
        <div style={styles.decorations}>
          <div style={{ ...styles.decoration, animationDelay: '0s' }}>✨</div>
          <div style={{ ...styles.decoration, animationDelay: '0.5s' }}>🌟</div>
          <div style={{ ...styles.decoration, animationDelay: '1s' }}>💫</div>
          <div style={{ ...styles.decoration, animationDelay: '1.5s' }}>⭐</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: {
    textAlign: 'center',
    position: 'relative',
  },
  spinnerContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    margin: '0 auto 30px',
  },
  spinner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '8px solid rgba(255, 255, 255, 0.3)',
    borderTop: '8px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: 'calc(100% - 40px)',
    height: 'calc(100% - 40px)',
    border: '6px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '6px solid #ffffff',
    borderRadius: '50%',
    animation: 'spinReverse 0.8s linear infinite',
  },
  message: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '30px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  dots: {
    display: 'inline-block',
    width: '30px',
    textAlign: 'left',
  },
  progressBar: {
    width: '300px',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    margin: '0 auto',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffffff 0%, #f0f0f0 100%)',
    borderRadius: '10px',
    animation: 'progressFill 2s ease-in-out infinite',
  },
  decorations: {
    position: 'absolute',
    top: '-50px',
    left: '-50px',
    right: '-50px',
    bottom: '-50px',
    pointerEvents: 'none',
  },
  decoration: {
    position: 'absolute',
    fontSize: '30px',
    animation: 'float 3s ease-in-out infinite',
  } as React.CSSProperties & { animationDelay?: string },
};
