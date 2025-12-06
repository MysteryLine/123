'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
}

const ParticleLoading: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置canvas尺寸
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 定义「菊园」文字的粒子目标位置
        const generateTextParticles = (): Array<{ x: number; y: number; color: string }> => {
            const particles: Array<{ x: number; y: number; color: string }> = [];
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
            
            // 绘制「菊」字的粒子阵列（简化版网格）
            const baseX = canvas.width / 2 - 60;
            const baseY = canvas.height / 2 - 40;
            
            // 「菊」字形状（用点阵表示）
            const juPattern = [
                '  ███  ',
                ' █   █ ',
                ' █ █ █ ',
                ' █████ ',
                '   █   ',
                '   █   ',
            ];
            
            // 「园」字形状
            const yuanPattern = [
                ' █████ ',
                ' █   █ ',
                ' █ █ █ ',
                ' █   █ ',
                ' █████ ',
            ];

            let colorIndex = 0;
            
            // 绘制「菊」
            juPattern.forEach((row, y) => {
                row.split('').forEach((char, x) => {
                    if (char === '█') {
                        particles.push({
                            x: baseX + x * 8,
                            y: baseY + y * 8,
                            color: colors[colorIndex % colors.length],
                        });
                        colorIndex++;
                    }
                });
            });

            // 绘制「园」
            yuanPattern.forEach((row, y) => {
                row.split('').forEach((char, x) => {
                    if (char === '█') {
                        particles.push({
                            x: baseX + 80 + x * 8,
                            y: baseY + 20 + y * 8,
                            color: colors[colorIndex % colors.length],
                        });
                        colorIndex++;
                    }
                });
            });

            return particles;
        };

        const textParticles = generateTextParticles();

        // 初始化粒子
        const initializeParticles = () => {
            particlesRef.current = textParticles.map((tp) => ({
                x: canvas.width / 2 + (Math.random() - 0.5) * 400,
                y: canvas.height / 2 + (Math.random() - 0.5) * 400,
                targetX: tp.x,
                targetY: tp.y,
                vx: 0,
                vy: 0,
                color: tp.color,
                size: 4 + Math.random() * 2,
            }));
        };

        initializeParticles();

        // 模拟加载进度
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress > 90) currentProgress = 90;
            setProgress(Math.floor(currentProgress));
        }, 200);

        // 动画循环
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 背景渐变
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(0.5, '#764ba2');
            gradient.addColorStop(1, '#f093fb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 更新和绘制粒子
            particlesRef.current.forEach((particle) => {
                // 根据进度计算粒子应该移动的距离
                const progressRatio = progress / 100;
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 缓动移动
                const moveSpeed = Math.max(2, distance * 0.08);
                if (distance > 1) {
                    particle.vx += (dx / distance) * moveSpeed - particle.vx * 0.1;
                    particle.vy += (dy / distance) * moveSpeed - particle.vy * 0.1;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                } else {
                    particle.x = particle.targetX;
                    particle.y = particle.targetY;
                }

                // 绘制粒子
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.003) * 0.2;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;

            // 绘制进度文字
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${progress}%`, canvas.width / 2, canvas.height / 2 + 80);

            // 进度条
            const progressBarWidth = 200;
            const progressBarX = (canvas.width - progressBarWidth) / 2;
            const progressBarY = canvas.height / 2 + 120;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, 4);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(progressBarX, progressBarY, (progressBarWidth * progress) / 100, 4);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // 加载完成
        const completeTimeout = setTimeout(() => {
            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
                setShowLogo(true);
                setTimeout(() => {
                    setShowLogo(false);
                }, 1000);
            }, 500);
        }, 3000);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            clearInterval(progressInterval);
            clearTimeout(completeTimeout);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [progress]);

    return (
        <div style={styles.container}>
            <canvas ref={canvasRef} style={styles.canvas} />
            {showLogo && (
                <div style={styles.logoOverlay}>
                    <div style={styles.logoText}>菊园</div>
                </div>
            )}
            <style jsx>{`
        @keyframes logoFlash {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        overflow: 'hidden',
    },
    canvas: {
        display: 'block',
        width: '100%',
        height: '100%',
    },
    logoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    logoText: {
        fontSize: '80px',
        fontWeight: 'bold',
        color: '#ffffff',
        textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
        animation: 'logoFlash 1s ease-in-out',
    },
};

export default ParticleLoading;
